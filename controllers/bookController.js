const { selectBooks, selectAllGenre, getGenre, selectBookByGenreId, insertBook, selectBookById, updateBookDetails, insertGenre, removeGenreById, removeBookById, searchBook, updateBook } = require("../db/queries");
const { body, validationResult } = require('express-validator')
const asyncHandler = require('express-async-handler');

const bookValidation = [
    body('title').trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('title must be of 1 to 255 characters'),
    body('page').trim()
        .isInt({ min: 1 })
        .withMessage('page must be atlest 1'),
    body('description').trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('character limit reached, only 500 characters'),
    body('price').trim()
        .isNumeric({ min: 0 })
        .withMessage('price must be atlest 0'),
    body('author').isArray({ min: 1 }).withMessage("At least one author required"),
    body('genre').custom(async (value) => {
        const genre = await getGenre(value);
        if (!genre) {
            throw new Error('unknown genre create or select other');
        }
    })
]


const getBookByGenre = async (genre) => {
    const genreInfo = await getGenre(genre);
    if (genreInfo) {
        const books = await selectBookByGenreId(genreInfo.id);
        return books;
    }
    return [];
}


const getBooks = async (req, res) => {
    let { author, title } = req.query;
    const genres = await selectAllGenre();
    if (author || title) {
        author = author.trim();
        title = title.trim();
        const books = await searchBook(author, title);
        res.render('home', { books, genres, pageTitle: "Search Result" })
        return
    }
    if (req.query.genre) {
        const books = await getBookByGenre(req.query.genre)
        res.render('home', { books, genres, pageTitle: "All Books" })
        return;
    }
    const books = await selectBooks();
    res.render('home', { books, genres, pageTitle: "All Books" })
}

const createBookGet = async (req, res) => {
    const genres = await selectAllGenre();
    res.render('create', { genres });
}

const createBookPost = [
    bookValidation,
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const genres = await selectAllGenre();
            res.render('create', { errors: errors.array(), genres })
            return
        }
        await insertBook(req.body);
        res.redirect('/');
    })
]

const updateFormGet = async (req, res) => {
    const { id } = req.params;
    const genres = await selectAllGenre();
    let [book] = await selectBookById(id);

    res.render('update', { book, genres })
}

const updateBookPut = [
    bookValidation,
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const genres = await selectAllGenre();
            let [book] = await selectBookById(id);
            res.render('update', { errors: errors.array(), genres, book })
            return
        }
        const isUpdated = await updateBookDetails(id, req.body);
        if (isUpdated) {
            res.redirect('/');
        }
    })
]

const genreValidation = [
    body('genre')
        .trim()
        .notEmpty()
        .withMessage('Genre cannot be empty')
]

const createGenrePost = [
    genreValidation,
    async (req, res) => {
        const { genre } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty) {
            res.redirect('/');
        }
        await insertGenre(genre);
        res.redirect('/');
    }

]

const deleteGenre = async (req, res) => {
    const referer = req.headers.referer;
    const { id } = req.params;
    const row = await selectBookByGenreId(id);
    if (row.length < 1) {
        await removeGenreById(id);
        res.redirect('/');
        return
    }
    res.redirect(referer);
}

const deleteBook = async (req, res) => {
    await removeBookById(req.params.id);
    res.redirect(req.headers.referer);
}

const getSearchForm = async (req, res) => {
    res.render('search');
}

module.exports = {
    getBooks, createBookGet, createBookPost, updateFormGet, updateBookPut, createGenrePost, deleteGenre, deleteBook, getSearchForm
}