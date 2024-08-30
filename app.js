const express = require('express');
require('dotenv').config();
const methodOverride = require('method-override');
const { PORT } = process.env;
const path = require('node:path');
const bookRouter = require('./routes/bookRouter');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', bookRouter);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})