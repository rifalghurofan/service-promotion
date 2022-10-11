const mongoose = require('mongoose');
require('dotenv').config();
mongoose.Promise = global.Promise;

const db = mongoose.connect(process.env.MONGODB_URI);
db.mongoose = mongoose;
db.Promotions = require("./promotions");
db.Descriptions = require("./descriptions");
module.exports = db;