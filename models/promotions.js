const mongoose = require("mongoose");
const Promotions = mongoose.model(
    "promosi",
    new mongoose.Schema(
        {
            id: String,
            cover_url: {
                type: String,
                default: null,
            },
            title: String,
            creator_id: String,
            name: String,
            caption: String,
            description: Array,
            likes: Number,
            is_likes: {
                type: Boolean,
                default: false,
            },
            category: String,
            city_target: Array,
            province_target: String,
            total_clicks: {
                type: Number,
                default: 0,
            },
            total_views: {
                type: Number,
                default: 0,
            },
            created_at: String,
            updated_at: String,
            deleted_at: String,
            expired_at: String,
            creator: Object,
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
            },
            rejected_message: String,
        },
        {
            collection: "promosi",
            versionKey: false,
        }
    )
);
module.exports = Promotions;
