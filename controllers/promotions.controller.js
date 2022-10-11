const Promotions = require("../models/promotions");
const Descriptions = require("../models/descriptions");
const check = require('joi');
const { uploadDrive, updateDrive, getId, daleteMedia } = require('../utils/drive');
require("dotenv").config();

//get all data without paginations
const getAll = async (req, res) => {
    Promotions.find({})
        .populate('description_id')
        .then(data => {
            res.send(data)
        })
        .catch(err => {
            res.status(500).send(err.message);
        });
}
//read data
const read = async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const search = req.query.search;
    const startIndex = (page - 1) * limit;

    const result = {};
    try {
        result.results = await Promotions.find({
            city_target: { $regex: search, $options: 'i' }
        }).clone().populate('description_id').limit(limit).skip(startIndex);
        res.send({
            data: result,
            page: page,
            limit: limit
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//create data
const create = async (req, res) => {
    //validations
    const Schema = check.object({
        title: check.string().required(),
        name: check.string().required(),
        caption: check.string().required(),
        category_id: check.string().required(),
        creator_id: check.string().required(),
        province_target: check.string().empty('').default(null),
        city_target: check.string().empty('').default(null),
        rejected_message: check.string().required(),
        reviewer_id: check.string().required(),
        status: check.string().required(),
    }).required();
    const { error } = Schema.validate(req.body)
    if (error) {
        return res.send({ message: error });
    }
    try {
        Descriptions.findOne({ title: req.body.title },
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

                    const newDes = new Descriptions({
                        title: req.body.title,
                        name: req.body.name,
                        caption: req.body.caption,
                        content: req.body.content,
                        type: req.body.type
                    })
                    //get req.body
                    const newProm = new Promotions({
                        category_id: req.body.category_id,
                        cover_url: urlCov,
                        creator_id: req.body.creator_id,
                        description_id: newDes._id,
                        province_target: req.body.province_target,
                        city_target: req.body.city_target,
                        rejected_message: req.body.rejected_message,
                        reviewer_id: req.body.reviewer_id,
                        status: req.body.status
                    });

                    newProm.save(function (err, result) {//save data to database
                        if (err) {
                            res.status(500).send(err.message);
                            return;
                        } else {
                            newDes.save()
                            res.status(500).send({ result });
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

//total click function
const click = async (req, res) => {
    Descriptions.findOne({ _id: req.params.id })
        .populate('description_id')
        .then(async data => {
            const inc = data.total_clicks += 1;
            await Promotions.updateOne({
                total_clicks: inc
            })
            res.send(data);
        })
        .catch(err => {
            res.status(500).send(err.message);
        });
}

//total_click & total_views
const viewOne = async (req, res) => {
    Promotions.findOne({ _id: req.params.id })
        .populate('description_id')
        .then(async data => {
            const inc = data.total_views += 1;
            await Promotions.updateOne({
                total_views: inc
            })
            res.send(data);
        })
        .catch(err => {
            res.status(500).send(err.message);
        });
}

//total_click & total_views
const likeOne = async (req, res) => {
    Promotions.findOne({ _id: req.params.id })
        .populate('description_id')
        .then(async data => {
            const inc = data.total_views += 1;
            const inc1 = data.likes += 1;
            await Promotions.updateOne({
                total_views: inc,
                likes: inc1
            })
            res.send(data);
        })
        .catch(err => {
            res.status(500).send(err.message);
        });
}

//update data
const updating = async (req, res) => {
    Promotions.findOneAndUpdate({ _id: req.params.id })
        .then(async data => {
            //pasring an id from cover file in Drive
            const idCov = getId(data.cover_url);

            // the id file to be replaced
            const filePath = req.files; //req for file

            if (Object.keys(filePath).length === 0) {
                res.send({ message: 'no media selected!' })
            } else {
                const covUrl = await updateDrive(filePath.cover[0], idCov);

                // get link to save on database Mongo
                const urlCov = covUrl.data.webViewLink;

                //validations
                const Schema = check.object({
                    title: check.string().required(),
                    name: check.string().required(),
                    caption: check.string().required(),
                    category_id: check.string().required(),
                    creator_id: check.string().required(),
                    province_target: check.string().empty('').default(null),
                    city_target: check.string().empty('').default(null),
                    rejected_message: check.string().required(),
                    reviewer_id: check.string().required(),
                    status: check.string().required(),
                })
                const { error } = Schema.validate(req.body)
                if (error) {
                    return res.send(error.message);
                }
                // update data
                const newDes = await Descriptions.updateOne({ description_id: data.description_id }, {
                    title: req.body.title,
                    name: req.body.name,
                    caption: req.body.caption,
                    content: req.body.content,
                    type: req.body.type
                });

                const result = await Promotions.updateOne({
                    title: req.body.title,
                    name: req.body.name,
                    caption: req.body.caption,
                    category_id: req.body.category_id,
                    cover_url: urlCov,
                    creator_id: req.body.creator_id,
                    description_id: newDes._id,
                    province_target: req.body.province_target,
                    city_target: req.body.city_target,
                    rejected_message: req.body.rejected_message,
                    reviewer_id: req.body.reviewer_id,
                    status: req.body.status,
                })
                if (result) {
                    res.send({ message: 'Updated successfully!' })
                }
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
    getAll,
    read,
    viewOne,
    click,
    likeOne,
    create,
    updating,
    deleting
}