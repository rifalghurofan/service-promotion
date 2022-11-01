const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const db = require("./models");
const PORT = process.env.PORT;
const { options } = require("joi");
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

// set port, listen for requests
app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`) });

//connection to MongoDb
db.mongoose
    .connect(process.env.MONGODB_URI,
        {
            useUnifiedTopology: true,
            useNewUrlParser: true
        }, 6000000)
    .then(() => {
        console.log("Successfully connect to MongoDB", mongoose.connection.readyState);
        // initial();
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });

// function initial() {
//     console.log('initialized!')
// }

// // routes
require('./routes/promotions.route.firebase')(app);

