const express = require("express");
const app = express();
const bodyParser = require('body-parser');

const compression = require('compression');
const path = require('path');
require('dotenv').config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// view engine setup
app.set('views', path.join(__dirname, 'static', 'views'))
app.set('view engine', 'ejs')
app.use(compression())
app.use('/public', express.static(path.join(__dirname, 'static', 'public')))

// // routes
require('./routes/promotions.route.firebase')(app);

module.exports = app;