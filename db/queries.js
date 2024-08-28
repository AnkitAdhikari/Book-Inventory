const db = require('./pool');

async function selectBooks(searchCategory) {
    if (searchCategory) {
        const { rows } = await db.query(`SELECT 
    b.title,
    b.page,
    b.genre,
    b.description,
    b.price,
    STRING_AGG(a.name, ', ' ORDER BY a.name ASC) AS authors
FROM 
    Book b
JOIN 
    Book_Author ba ON b.ID = ba.book_id
JOIN 
    Author a ON ba.author_id = a.ID
GROUP BY 
    b.ID HAVING b.genre ILIKE $1;`, [searchCategory]);
        return rows;
    } else {
        const { rows } = await db.query(`SELECT 
    b.title,
    b.page,
    b.genre,
    b.description,
    b.price,
    STRING_AGG(a.name, ', ' ORDER BY a.name ASC) AS authors
FROM 
    Book b
JOIN 
    Book_Author ba ON b.ID = ba.book_id
JOIN 
    Author a ON ba.author_id = a.ID
GROUP BY 
    b.ID;
`);
        return rows;
    }
}

async function selectAllCategory() {
    const { rows } = await db.query('select distinct genre from book;');
    return rows;
}

module.exports = {
    selectBooks,
    selectAllCategory
}