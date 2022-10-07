const Promotions = require("../models/promotions");
const check = require('joi');
const { uploadDrive, updateDrive, getId, daleteMedia } = require('../utils/drive');
require("dotenv").config();

//read data
const read = async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const result = {};
    if (endIndex < (await Promotions.countDocuments().exec())) {
        result.next = {
            page: page + 1,
            limit: limit,
        };
    }
    if (startIndex > 0) {
        result.previous = {
            page: page - 1,
            limit: limit,
        };
    }
    try {
        result.results = await Promotions.find().limit(limit).skip(startIndex);
        res.send(result);
    } catch (err) {
        res.status(500).json({ message: e.message });
    }
};

//total_click & total_views
const readOne = async (req, res) => {
    Promotions.findOne({ _id: req.params.id })
        .then(async data => {
            const inc = data.total_views += 1;
            await Promotions.updateOne({
                total_clicks: inc,
                total_views: inc
            })
            res.send({ data });
        })
        .catch(err => {
            res.status(500).send({ message: err });
        });
}

//create data
const create = async (req, res) => {
    //validations
    const Schema = check.object({
        title: check.string().required(),
        name: check.string().required(),
        caption: check.string().required(),
        category_id: check.string().required(),
        // cover: check.string().required(),
        creator_id: check.string().required(),
        description: check.string().required(),
        province_target: check.string().required(),
        city_target: check.string().required(),
        rejected_message: check.string().required(),
        reviewer_id: check.string().required(),
        status: check.string().required(),
    }).required();
    const { error } = Schema.validate(req.body)
    if (error) {
        return res.send({ message: error });
    }
    try {
        Promotions.findOne({ title: req.body.title },
            async function (err, promotions) {
                if (err) {
                    res.status(500).send({ message: err });
                } if (promotions) {
                    res.status(500).send({ message: req.body.title + " was already added!" });
                } else {

                    const filePath = req.files; //req for file

                    const covUrl = await uploadDrive(filePath.cover[0])

                    //get link to save on database Mongo
                    const urlCov = covUrl.data.webViewLink;

                    //get req.body
                    const create = new Promotions({
                        title: req.body.title,
                        name: req.body.name,
                        caption: req.body.caption,
                        category_id: req.body.category_id,
                        cover_url: urlCov,
                        creator_id: req.body.creator_id,
                        description: req.body.description,
                        province_target: req.body.province_target,
                        city_target: req.body.city_target,
                        rejected_message: req.body.rejected_message,
                        reviewer_id: req.body.reviewer_id,
                        status: req.body.status
                    });

                    create.save(function (err, result) {
                        if (err) {
                            res.status(500).send({ message: err });
                            return;
                        } else {
                            res.status(500).send({ message: 'Promotions data created! ' + result });
                        }
                    })
                }
            }
        )
    } catch (error) {
        console.log(error);
        res.send({ message: error });
    }
};

//update data
const updating = async (req, res) => {
    Promotions.findOneAndUpdate({ _id: req.params.id })
        .then(async data => {
            //update media func
            //pasring an id from cover file in Drive
            const idCov = getId(data.cover_url);

            // the id file to be replaced
            const filePath = req.files; //req for file

            const covUrl = await updateDrive(filePath.cover[0], idCov)

            // get link to save on database Mongo
            const urlCov = covUrl.data.webViewLink;

            //validations
            const Schema = check.object({
                title: check.string().required(),
                name: check.string().required(),
                caption: check.string().required(),
                category_id: check.string().required(),
                // cover: check.string().required(),
                creator_id: check.string().required(),
                description: check.string().required(),
                province_target: check.string().required(),
                city_target: check.string().required(),
                rejected_message: check.string().required(),
                reviewer_id: check.string().required(),
                status: check.string().required(),
            }).required();
            const { error } = Schema.validate(req.body)
            if (error) {
                return res.send(error.message);
            }
            // update data
            const result = await Promotions.updateOne({
                title: req.body.title,
                name: req.body.name,
                caption: req.body.caption,
                category_id: req.body.category_id,
                cover_url: urlCov,
                creator_id: req.body.creator_id,
                description: req.body.description,
                province_target: req.body.province_target,
                city_target: req.body.city_target,
                rejected_message: req.body.rejected_message,
                reviewer_id: req.body.reviewer_id,
                status: req.body.status,
                total_clicks: req.body.total_clicks,
                total_views: req.body.total_views
            })
            if (result) {
                res.send({ message: 'Updated successfully!' })
            }
        })
        .catch(err => {
            res.status(500).send({ message: err });
        });
}

//deleting data
const deleting = async (req, res) => {
    const idData = req.params.id;
    daleteMedia(idData)
    Promotions.deleteOne({ _id: idData },
        (err) => {
            if (err) {
                res.send({ message: err });
            } else
                res.send({ message: "Data has been deleted!" });
        }
    );
};

module.exports = {
    read,
    readOne,
    create,
    updating,
    deleting
}