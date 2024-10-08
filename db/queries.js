const db = require('./pool');
const asyncHandler = require('express-async-handler');
async function selectBooks() {
    const { rows } = await db.query(`
    SELECT 
    b.ID AS book_id,
    b.title,
    b.page,
    b.description,
    b.price,
    STRING_AGG(DISTINCT a.name, ', ') AS authors,
    STRING_AGG(DISTINCT g.name, ', ') AS genres
FROM 
    Book b
JOIN 
    Book_Author ba ON b.ID = ba.book_id
JOIN 
    Author a ON ba.author_id = a.ID
JOIN 
    Book_Genre bg ON b.ID = bg.book_id
JOIN 
    Genre g ON bg.genre_id = g.ID
GROUP BY 
    b.ID
ORDER BY 
    b.ID;
    `);

    return rows;

}

async function selectAllGenre() {
    const { rows } = await db.query('select * from Genre;');
    return rows;
}

async function getGenre(genre) {
    const { rows } = await db.query(`select * from Genre where name LIKE $1`, [genre]);
    if (rows.length > 0) {
        return rows[0];
    }
    return null;
}

async function selectBookById(id) {
    const { rows } = await db.query(`SELECT 
    b.ID AS id,
    b.title,
    ARRAY_AGG(DISTINCT a.name) AS authors,
    b.page,
    g.name AS genre,
    b.description,
    b.price
FROM 
    Book b
JOIN 
    Book_Author ba ON b.ID = ba.book_id
JOIN 
    Author a ON ba.author_id = a.ID
JOIN 
    Book_Genre bg ON b.ID = bg.book_id
JOIN 
    Genre g ON bg.genre_id = g.ID
WHERE 
    b.ID = $1 
GROUP BY 
    b.ID, g.name
LIMIT 1;`, [id]);
    return rows
}

async function selectBookByGenreId(id) {
    const { rows } = await db.query(`
        SELECT 
    b.ID AS book_id,
    b.title,
    b.page,
    b.description,
    b.price,
    STRING_AGG(DISTINCT a.name, ', ') AS authors,
    STRING_AGG(DISTINCT g.name, ', ') AS genres
FROM 
    Book b
JOIN 
    Book_Author ba ON b.ID = ba.book_id
JOIN 
    Author a ON ba.author_id = a.ID
JOIN 
    Book_Genre bg ON b.ID = bg.book_id
JOIN 
    Genre g ON bg.genre_id = g.ID
WHERE 
    g.ID = $1
GROUP BY 
    b.ID
ORDER BY 
    b.ID;
        `, [id]);
    return rows;
}

async function insertBook(book) {

    try {

        await db.query("BEGIN");

        const bookResult = await db.query(`
            INSERT INTO Book (title,page,description,price) VALUES ($1,$2,$3,$4) RETURNING ID
    `, [book.title, book.page, book.description, book.price]);

        const bookId = bookResult.rows[0].id;

        for (const authorName of book.author) {
            const authorResult = await db.query(`SELECT ID FROM Author WHERE name = $1`, [authorName]);

            let authorId;
            if (authorResult.rows.length > 0) {
                authorId = authorResult.rows[0].id;
            } else {
                const newAuthorResult = await db.query('INSERT INTO Author (name) VALUES ($1) RETURNING ID', [authorName]);
                authorId = newAuthorResult.rows[0].id;
            }

            // Insert into Book_Author relationship table
            await db.query(`INSERT INTO Book_Author (book_id, author_id) VALUES ($1, $2)`, [bookId, authorId]);
        }

        const genreResult = await db.query(`SELECT ID FROM Genre WHERE name = $1`, [book.genre]);

        let genreId = genreResult.rows[0].id;

        await db.query(`INSERT INTO Book_Genre (book_id, genre_id) VALUES ($1, $2)`, [bookId, genreId]);


        await db.query('COMMIT');
        return true;
    } catch {
        return false;
    }
}

async function updateBookDetails(id, book) {
    try {
        await db.query('BEGIN');

        // Step 1: Update the Book Table
        const updateBookQuery = `
            UPDATE Book
            SET 
                title = $1,
                page = $2,
                description = $3,
                price = $4
            WHERE 
                ID = $5;
        `;
        await db.query(updateBookQuery, [book.title, book.page, book.description, book.price, id]);

        // Step 2: Update Author Relationships
        await db.query('DELETE FROM Book_Author WHERE book_id = $1;', [id]);

        for (const authorName of book.author) {
            // Insert new authors if they don't exist, and retrieve their IDs
            const insertAuthorQuery = `
                INSERT INTO Author (name)
                VALUES ($1)
                ON CONFLICT (name) DO NOTHING
                RETURNING ID;
            `;
            const authorResult = await db.query(insertAuthorQuery, [authorName]);

            let authorId;
            if (authorResult.rows.length > 0) {
                // If the author was newly inserted, use the returned ID
                authorId = authorResult.rows[0].id;
            } else {
                // If the author already existed, fetch the ID
                const selectAuthorQuery = `SELECT ID FROM Author WHERE name = $1;`;
                const selectResult = await db.query(selectAuthorQuery, [authorName]);
                authorId = selectResult.rows[0].id;
            }

            // Create a relationship between the book and the author
            const insertBookAuthorQuery = `
                INSERT INTO Book_Author (book_id, author_id)
                VALUES ($1, $2);
            `;
            await db.query(insertBookAuthorQuery, [id, authorId]);
        }

        // Step 3: Update Genre Relationship
        await db.query('DELETE FROM Book_Genre WHERE book_id = $1;', [id]);

        const insertGenreQuery = `
            WITH inserted_genre AS (
                INSERT INTO Genre (name)
                VALUES ($1)
                ON CONFLICT (name) DO NOTHING
                RETURNING ID
            )
            INSERT INTO Book_Genre (book_id, genre_id)
            SELECT $2, ID FROM Genre WHERE name = $1;
        `;
        await db.query(insertGenreQuery, [book.genre, id]);

        await db.query('COMMIT');
        return true;
    } catch (e) {
        await db.query('ROLLBACK');
        console.error('Error during book update:', e);
        return false;
    }
}


async function insertGenre(genre) {
    try {
        await db.query('INSERT INTO Genre (name) VALUES ($1)', [genre]);
        return true;
    } catch (e) {
        return false;
    }
}

async function removeGenreById(id) {
    try {
        await db.query(`delete from genre where id = $1`, [id]);
        return true;
    } catch {
        return false
    }
}



async function removeBookById(id) {
    try {
        await db.query(`WITH deleted_book AS (
      DELETE FROM Book
      WHERE ID = $1
      RETURNING *
    )
    SELECT COUNT(*) FROM deleted_book;`, [id]);
        return true;
    } catch (e) {
        return false;
    }
}

async function searchBook(author, title) {

    const { rows } = await db.query(`SELECT 
    b.ID,
    b.title,
    b.page,
    b.description,
    b.price,
    array_agg(a.name) AS authors,
    array_agg(g.name) AS genres
FROM 
    Book b
LEFT JOIN 
    Book_Author ba ON b.ID = ba.book_id
LEFT JOIN 
    Author a ON ba.author_id = a.ID
LEFT JOIN 
    Book_Genre bg ON b.ID = bg.book_id
LEFT JOIN 
    Genre g ON bg.genre_id = g.ID
WHERE 
    (COALESCE($1, '') = '' OR b.title ILIKE '%' || COALESCE($1, '') || '%')
    AND
    (COALESCE($2, '') = '' OR a.name ILIKE '%' || COALESCE($2, '') || '%')
GROUP BY 
    b.ID;

`, [title, author])

    return rows;
}

module.exports = {
    selectBooks,
    selectAllGenre,
    getGenre,
    selectBookByGenreId,
    insertBook,
    selectBookById, updateBookDetails,
    insertGenre,
    removeGenreById,
    removeBookById,
    searchBook
}