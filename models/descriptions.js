const mongoose = require("mongoose");
const Descriptions = mongoose.model(
    "Descriptions",
    new mongoose.Schema({
        title: String,
        name: String,
        caption: String,
        content: String,
        type: {
            type: String,
            enum: ['COMPLETE', 'INCOMPLETE']
        }
    }, {
        collection: 'Descriptions',
        versionKey: false
    })
);
module.exports = Descriptions;
