const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const router = require('./routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const createError = require('http-errors');
const passport = require('./config/passport');

require('dotenv').config({
    path: './variables.env'
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.engine('handlebars', exphbs({
    defaultLayout: 'layout',
    helpers: require('./helpers/handlebars')
}));

app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

app.use('/', router());

app.use((req, res, next) => {
    next(createError(404, 'No encontrado'));
});

app.use((err, req, res) => {
    res.locals.message = err.message;
    const status = err.status || 500;
    res.locals.status = err.status;
    res.status(status);
    res.render('error');
});

app.listen(process.env.PORT, () => {
    console.log(`Server running in the port ${process.env.PORT}`);
});