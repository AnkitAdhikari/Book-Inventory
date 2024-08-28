const { Router } = require("express");
const { getBooks } = require("../controllers/bookController");

const bookRouter = Router();

bookRouter.get('/', getBooks);

module.exports = bookRouter;
