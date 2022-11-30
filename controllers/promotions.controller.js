const Promotions = require("../models/promotions");
const { admin } = require("../utils/firebase");
const storageRef = admin.storage().bucket();
var fs2 = require("fs-extra");
const { uid } = require("uid");
require("dotenv").config();

const muatKelolaPromosi = async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    //  status: { $ne: "ARCHIVED" }
    await Promotions.find({ status: { $ne: "ARCHIVED" } })
        .sort({ updated_at: 1 })
        .limit(limit)
        .skip(startIndex)
        .then((data) => {
            let newData = [];
            data.map((element) => {
                if (!isNaN(element.created_at)) {
                    let newElement = {
                        ...element._doc,
                        updated_at: parseInt(element.updated_at),
                        created_at: parseInt(element.created_at),
                        expired_at: parseInt(element.expired_at),
                    };
                    newData.push(newElement);
                } else {
                    let newElements = {
                        ...element._doc,
                        updated_at: new Date(element.updated_at).getTime(),
                        created_at: new Date(element.created_at).getTime(),
                        expired_at: new Date(element.expired_at).getTime(),
                    };
                    newData.push(newElements);
                }
            });
            res.status(200).json({
                status: "OK",
                data: newData,
                page: page,
                limit: limit,
            });
        })
        .catch((err) => {
            res.status(500).json({
                status: "ERR",
                message: err.message,
                data: [],
            });
        });
};

//total_click & total_views
const detailPromosi = async (req, res) => {
    await Promotions.findOne({ _id: req.params.id })
        .then((data) => {
            if (!isNaN(data.created_at)) {
                let newData = [];
                [data].map((element) => {
                    let newElement = {
                        ...element._doc,
                        updated_at: parseInt(element.updated_at),
                        created_at: parseInt(element.created_at),
                        expired_at: parseInt(element.expired_at),
                    };

                    newData.push(newElement);
                });
                res.status(200).json({
                    status: "OK",
                    data: newData[0],
                });
            } else {
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
                    data: newData[0],
                });
            }
        })
        .catch((err) => {
            console.log(err);
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
        "creator_id",
        "name",
        "caption",
        "category",
        "creator",
    ];
    let required = [];
    const {
        cover_url,
        title,
        creator_id,
        name,
        caption,
        description,
        likes,
        is_liked,
        category,
        city_target,
        province_target,
        total_clicks,
        total_views,
        creator,
        reviewer,
        rejected_message,
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
            id: uid(24),
            title: title,
            name: name,
            caption: caption,
            category: category,
            cover_url: cover_url,
            creator: creator,
            creator_id: creator_id,
            description: description,
            province_target: province_target,
            city_target: city_target,
            rejected_message: rejected_message,
            reviewer: reviewer,
            status: "PENDING",
            likes: likes,
            is_liked: is_liked,
            total_clicks: total_clicks,
            total_views: total_views,
            created_at: Date.now(),
            expired_at: Date.now(),
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
    const {
        cover_url,
        title,
        creator_id,
        name,
        caption,
        description,
        likes,
        is_liked,
        category,
        city_target,
        province_target,
        total_clicks,
        total_views,
        creator,
        reviewer,
        rejected_message,
        created_at,
        expired_at,
        status,
    } = req.body;

    await Promotions.findOneAndUpdate(
        {
            _id: req.params.id,
        },
        {
            $set: {
                title: title,
                name: name,
                caption: caption,
                category: category,
                cover_url: cover_url,
                creator: creator,
                creator_id: creator_id,
                description: description,
                province_target: province_target,
                city_target: city_target,
                rejected_message: rejected_message,
                reviewer: reviewer,
                status: status,
                likes: likes,
                is_liked: is_liked,
                total_clicks: total_clicks,
                total_views: total_views,
                created_at: created_at,
                updated_at: Date.now(),
                expired_at: expired_at,
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
    // }
};

const uploadFilePromosi = async (req, res) => {
    // foreach for handle multiple media
    const { directory } = req.body;
    const file = req.file;

    const uploadCover = await storageRef.upload(file.path, {
        gzip: true,
        destination: `${directory}/${file.originalname}`,
    });

    let urlCover = [];
    await storageRef
        .file(uploadCover[0].name)
        .getSignedUrl({
            action: "read",
            expires: "03-09-2491",
        })
        .then((result) => {
            fs2.emptyDirSync("./public/cover");
            urlCover = result[0];
        })
        .catch((err) => {
            console.log(err);
            res.status(200).json({
                status: "ERR",
                message: err.message,
            });
        });
    res.status(200).json({
        status: "OK",
        message: "Uploaded",
        data: urlCover,
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

//deleting data
const deletePromosi = async (req, res) => {
    const { id } = req.params;
    await Promotions.findOne({ _id: id }).then((data) => {
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
    deletePromosi,
};
