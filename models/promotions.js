const mongoose = require("mongoose");
const Promotions = mongoose.model(
    "Promotions",
    new mongoose.Schema(
        {
            title: String,
            name: String,
            caption: String,
            category_id: String,
            cover_url: {
                type: String,
                default: null,
            },
            creator_id: String,
            province_target: String,
            city_target: String,
            rejected_message: String,
            reviewer_id: String,
            status: {
                type: String,
                enum: [
                    "PENDING",
                    "ACTIVE",
                    "ARCHIVED",
                    "DELETED",
                    "REJECTED",
                    "HIDE",
                ],
                default: "PENDING",
            },
            total_clicks: {
                type: Number,
                default: 0,
            },
            total_views: {
                type: Number,
                default: 0,
            },
            created_at: Object,
            updated_at: Object,
            expired_at: Object,
        },
        {
            collection: "Promotions",
            versionKey: false,
        }
    )
);
module.exports = Promotions;
