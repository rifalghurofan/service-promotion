const mongoose = require("mongoose");
const Promotions = mongoose.model(
    "Promotions",
    new mongoose.Schema({
        title: String,
        name: String,
        caption: String,
        category_id: String,
        cover_url: String,
        creator_id: String,
        description: String,
        province_target: String,
        city_taget: String,
        rejected_message: String,
        reviewer_id: String,
        status: {
            type: String,
            enum: ['active', 'passive']
        },
        total_clicks: String,
        total_views: String
    }, {
        collection: 'Promotions',
        versionKey: false
    })
);
module.exports = Promotions;