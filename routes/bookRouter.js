const { Router } = require("express");
const { getBooks, createBookGet, createBookPost, updateFormGet, updateBookPut } = require("../controllers/bookController");

const bookRouter = Router();

bookRouter.get('/', getBooks);
bookRouter.get('/new', createBookGet);
bookRouter.post('/', createBookPost);
// bookRouter.post('/:id') postNewBook
bookRouter.get('/update/:id', updateFormGet)
bookRouter.put('/:id', updateBookPut);
// bookRouter.get('/search) getSearch form
// bookRouter.post('/genre') postNewGenre
// bookRouter.put('/genre/:id') updateNewGenre
// bookRouter.delete('/genre/:id') deleteGenre

module.exports = bookRouter;
