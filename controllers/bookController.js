const { selectBooks, selectAllCategory } = require("../db/queries")

const getBooks = async (req, res) => {
    const searchCategory = req.query.category;
    let books;
    if (searchCategory) {
        books = await selectBooks(searchCategory);
    } else {
        books = await selectBooks();
    }
    const category = await selectAllCategory();
    console.log(category);
    res.render('home', { books, category, pageTitle: "All Books" })
}

module.exports = {
    getBooks
}