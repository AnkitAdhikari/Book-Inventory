const { Router } = require("express");
const { getBooks, createBookGet, createBookPost, updateFormGet, updateBookPut, createGenrePost, deleteGenre, deleteBook, getSearchForm } = require("../controllers/bookController");
const asyncHandler = require('express-async-handler');

const bookRouter = Router();

bookRouter.get('/', asyncHandler(getBooks));
bookRouter.get('/new', asyncHandler(createBookGet));
bookRouter.post('/', createBookPost);
bookRouter.get('/update/:id', asyncHandler(updateFormGet))
bookRouter.put('/:id', updateBookPut);
bookRouter.delete('/:id', asyncHandler(deleteBook));
bookRouter.get('/search', asyncHandler(getSearchForm));
bookRouter.post('/genre', asyncHandler(createGenrePost))
bookRouter.delete('/genre/:id', asyncHandler(deleteGenre))

module.exports = bookRouter;
