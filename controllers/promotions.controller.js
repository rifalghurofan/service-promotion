const redis = require("@redis/search");
const Promotions = require("../models/promotions");
require("dotenv").config();

const getPromotions = async (req, res) => {
    let promotion = [];
    Promotions.find({})
        .sort({ updated_at: -1 })
        .then((data) => {
            promotion = data.map((element) => {
                const temp = element;
                temp.created_at = {
                    mili: temp.created_at * 10000,
                };
                temp.updated_at = {
                    mili: temp.updated_at * 10000,
                };
                return temp;
            });
            res.status(200).json({
                status: "OK",
                data: promotion,
            });
        });
};

//total_click & total_views
const getPromotion = async (req, res) => {
    Promotions.findOne({ _id: req.params.id })
        .then(async (data) => {
            const inc = (data.total_views += 1);
            await Promotions.updateOne({
                total_views: inc,
            });
            res.status(200).json({
                status: "OK",
                data: data,
            });
        })
        .catch((err) => {
            res.status(500).json(err.message);
        });
};

//create data
const addPromotion = async (req, res) => {
    //validations
    const field = [
        "title",
        "name",
        "caption",
        "category_id",
        "creator_id",
        "province_target",
        "city_target",
        "rejected_message",
        "reviewer_id",
    ];
    let required = [];
    const {
        title,
        name,
        caption,
        category_id,
        creator_id,
        province_target,
        city_target,
        rejected_message,
        reviewer_id,
    } = req.body;
    field.forEach((e) => {
        if (!req.body[e]) {
            required.push(e);
        }
    });
    if (required.length > 0) {
        res.status(400).json({
            status: "error",
            message: `please fill required field : ${required}!`,
        });
    } else {
        //get value of promotion from req.body
        await Promotions.create({
            title: title,
            name: name,
            caption: caption,
            category_id: category_id,
            creator_id: creator_id,
            province_target: province_target,
            city_target: city_target,
            rejected_message: rejected_message,
            reviewer_id: reviewer_id,
            status: "PENDING",
            created_at: Date.now(),
            updated_at: Date.now(),
        })
            .then((data) => {
                res.status(200).json({
                    status: "OK",
                    message: "Promosi ditambahkan!",
                    data: data,
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: "ERR",
                    message: err.message,
                });
            });
    }
};

//update data
const updatePromotion = async (req, res) => {
    //validations
    const field = [
        "title",
        "name",
        "caption",
        "category_id",
        "creator_id",
        "province_target",
        "city_target",
        "rejected_message",
        "reviewer_id",
    ];
    let required = [];
    const {
        title,
        name,
        caption,
        category_id,
        creator_id,
        province_target,
        city_target,
        rejected_message,
        reviewer_id,
    } = req.body;
    field.forEach((e) => {
        if (!req.body[e]) {
            required.push(e);
        }
    });
    if (required.length > 0) {
        res.status(400).json({
            status: "error",
            message: `please fill required field : ${required}!`,
        });
    } else {
        Promotions.findOneAndUpdate(
            {
                _id: req.params.id,
            },
            {
                $set: {
                    title: title,
                    name: name,
                    caption: caption,
                    category_id: category_id,
                    creator_id: creator_id,
                    province_target: province_target,
                    city_target: city_target,
                    rejected_message: rejected_message,
                    reviewer_id: reviewer_id,
                    status: "PENDING",
                    updated_at: Date.now(),
                },
            },
            { new: true }
        )
            .then((data) => {
                res.status(200).json({
                    status: "OK",
                    message: "Promosi di edit!",
                    data: data,
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: "ERR",
                    message: err.message,
                });
            });
    }
};

//deleting data
const deletePromotion = async (req, res) => {
    const { id } = req.params;
    Promotions.findOne({ _id: id }).then((data) => {
        if (data) {
            Promotions.deleteOne({ _id: id })
                .then(() => {
                    res.send({ message: "Deleted Succesfully!" });
                })
                .catch((err) => {
                    res.send(err || { message: "Not found!" });
                });
        } else {
            res.send({ message: "Promotions not found!" });
        }
    });
};

module.exports = {
    getPromotions,
    getPromotion,
    addPromotion,
    updatePromotion,
    deletePromotion,
};
