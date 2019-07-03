const mongoose = require('mongoose');
require('dotenv').config({
    path: 'variables.env'
});

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true
});

mongoose.connection.on('error', (err) => {
    console.log(err);
});

require('../models/Users');
require('../models/Offers');