const Promotions = require("../models/promotions");
const { admin } = require("../utils/firebase");
const storageRef = admin.storage().bucket();
var fs2 = require("fs-extra");
require("dotenv").config();

const muatKelolaPromosi = async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;

    Promotions.find({})
        .sort({ updated_at: -1 })
        .limit(limit)
        .skip(startIndex)
        .then((data) => {
            let newData = [];
            data.map((element) => {
                let newElement = {
                    ...element._doc,
                    updated_at: new Date(element.updated_at).getTime(),
                    created_at: new Date(element.created_at).getTime(),
                    expired_at: new Date(element.expired_at).getTime(),
                };

                newData.push(newElement);
            });
            res.status(200).json({
                status: "OK",
                data: newData,
                page: page,
                limit: limit,
            });
        });
};

//total_click & total_views
const detailPromosi = async (req, res) => {
    await Promotions.findOne({ _id: req.params.id })
        .then((data) => {
            let newData = [];
            [data].map((element) => {
                let newElement = {
                    ...element._doc,
                    updated_at: new Date(element.updated_at).getTime(),
                    created_at: new Date(element.created_at).getTime(),
                    expired_at: new Date(element.expired_at).getTime(),
                };

                newData.push(newElement);
            });
            res.status(200).json({
                status: "OK",
                data: newData,
            });
        })
        .catch((err) => {
            res.status(500).json({
                status: "ERR",
                message: err.message,
            });
        });
};

//create data
const tambahPromosi = async (req, res) => {
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
const editPromosi = async (req, res) => {
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

const uploadFilePromosi = async (req, res) => {
    // foreach for handle multiple media
    const { directory } = req.body;
    const file = req.file;

    const uploadCover = await storageRef.upload(file.path, {
        gzip: true,
        destination: `${directory}${file.originalname}`,
    });

    await storageRef
        .file(uploadCover[0].name)
        .getSignedUrl({
            action: "read",
            expires: "03-09-2491",
        })
        .then((result) => {
            fs2.emptyDirSync("./public/cover");
            res.status(200).json({
                status: "OK",
                message: "Uploaded",
                file: result[0],
            });
        })
        .catch((err) => {
            res.status(200).json({
                status: "ERR",
                message: err.message,
            });
        });
};

const cariPromosi = async (req, res) => {
    const search = req.query.search;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;

    try {
        await Promotions.find({
            name: {
                $regex: search,
                $options: "i",
            },
        })
            .clone()
            .limit(limit)
            .skip(startIndex)
            .then((data) => {
                res.status(200).json({
                    data: data,
                    page: page,
                    limit: limit,
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: "ERR",
                    message: err.message,
                });
            });
    } catch (err) {
        res.status(500).json({
            status: "ERR",
            message: err.message,
        });
    }
};

// //deleting data
// const deletePromosi = async (req, res) => {
//     const { id } = req.params;
//     Promotions.findOne({ _id: id }).then((data) => {
//         if (data) {
//             Promotions.deleteOne({ _id: id })
//                 .then(() => {
//                     res.send({ message: "Deleted Succesfully!" });
//                 })
//                 .catch((err) => {
//                     res.send(err || { message: "Not found!" });
//                 });
//         } else {
//             res.send({ message: "Promotions not found!" });
//         }
//     });
// };

// const terbitkan = (req, res) => {
//     //function for generate expired time
//     const secondsToMidnight = (n) => {
//         return (
//             ((24 - n.getHours() - 1) * 60 * 60) + ((60 - n.getMinutes() - 1) * 60) + (60 - n.getSeconds())
//         )
//     }
//     const currentTime = new Date()
//     const expiry = currentTime.getTime() + (secondsToMidnight(currentTime) * 1000)

//     //find data and update field status and expired_at from promotion table
//     Promotions.findOneAndUpdate({ _id: req.params.id }, {
//         $set: {
//             status: 'PUBLISHED',
//             expired_at: expiry
//         }
//     }).then(() => {
//         //find again updated data promotions
//         Promotions.findOne({ _id: req.params.id }).populate('description_id').then(result => {
//             res.send({
//                 message: 'Promotions has been published!',
//                 Promotions: result
//             });
//         })
//     }).catch(err => {
//         res.status(500).send(err.message);
//     });
// };

module.exports = {
    muatKelolaPromosi,
    detailPromosi,
    editPromosi,
    tambahPromosi,
    cariPromosi,
    uploadFilePromosi,
};
