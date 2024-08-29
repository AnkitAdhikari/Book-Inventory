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

module.exports = {
    selectBooks,
    selectAllGenre
}