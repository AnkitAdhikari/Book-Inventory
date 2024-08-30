const db = require('./pool');

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
    const { rows } = await db.query(`select * from Genre where name ILIKE $1`, [genre]);
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

async function updateBook(id, book) {
    console.log(book);
    try {
        await db.query('BEGIN');

        await db.query(`UPDATE Book
      SET 
          title = $1,
          page = $2,
          description = $3,
          price = $4
      WHERE 
          ID = $5;`, [book.title, book.page, book.description, book.price, id])

        await db.query(`DELETE FROM Book_Author WHERE book_id = $1;`, [id]);

        await db.query(`WITH inserted_authors AS (
          INSERT INTO Author (name)
          VALUES ${book.author.map((_, i) => `($${i + 1})`).join(', ')}
          ON CONFLICT (name) DO NOTHING
          RETURNING ID, name
      )
      INSERT INTO Book_Author (book_id, author_id)
      SELECT $${book.author.length + 1}, ID FROM Author WHERE name IN (${book.author.map((_, i) => `$${i + 1}`).join(', ')});
    `, [...book.author, id])

        await db.query(`DELETE FROM Book_Genre WHERE book_id = $1;`, [id]);

        await db.query(`
      WITH inserted_genre AS (
          INSERT INTO Genre (name)
          VALUES ($1)
          ON CONFLICT (name) DO NOTHING
          RETURNING ID
      )
      INSERT INTO Book_Genre (book_id, genre_id)
      SELECT $2, ID FROM Genre WHERE name = $1;
    `, [book.genre, id]);

        await db.query('COMMIT');
        return true;
    } catch (e) {
        await db.query("ROLLBACK");
        console.log(e);
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

        const insertAuthorQuery = `
          WITH inserted_authors AS (
              INSERT INTO Author (name)
              VALUES ${book.author.map((_, i) => `($${i + 1})`).join(', ')}
              ON CONFLICT (name) DO NOTHING
              RETURNING ID, name
          )
          INSERT INTO Book_Author (book_id, author_id)
          SELECT $${book.author.length + 1}, ID FROM Author WHERE name IN (${book.author.map((_, i) => `$${i + 1}`).join(', ')});
        `;
        await db.query(insertAuthorQuery, [...book.author, id]);

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
        console.log(e);
        return false;
    }
}

module.exports = {
    selectBooks,
    selectAllGenre,
    getGenre,
    selectBookByGenreId,
    insertBook,
    selectBookById, updateBook, updateBookDetails
}