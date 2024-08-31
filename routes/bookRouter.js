const { Router } = require("express");
const { getBooks, createBookGet, createBookPost, updateFormGet, updateBookPut, createGenrePost, deleteGenre, deleteBook, getSearchForm } = require("../controllers/bookController");

const bookRouter = Router();

bookRouter.get('/', getBooks);
bookRouter.get('/new', createBookGet);
bookRouter.post('/', createBookPost);
bookRouter.get('/update/:id', updateFormGet)
bookRouter.put('/:id', updateBookPut);
bookRouter.delete('/:id', deleteBook);
bookRouter.get('/search', getSearchForm);
bookRouter.post('/genre', createGenrePost)
bookRouter.delete('/genre/:id', deleteGenre)

module.exports = bookRouter;
