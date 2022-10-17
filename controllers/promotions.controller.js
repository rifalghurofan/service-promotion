const Promotions = require("../models/promotions");
const Descriptions = require("../models/descriptions");
const check = require('joi');
const fs = require('fs-extra');
const { uploadDrive, updateDrive, getId, daleteMedia, deleteDes } = require('../utils/drive');
require("dotenv").config();

//get all data without paginations
const getAll = async (req, res) => {
    let promo = []
    Promotions.find({}).populate('description_id')
        .then(data => {
            stories = data.map((element) => {
                const temp = element
                temp.created_at =
                {
                    mili: temp.created_at,
                    micro: temp.created_at * 1000
                }
                temp.updated_at =
                {
                    mili: temp.updated_at,
                    micro: temp.updated_at * 1000
                }
                return temp
            })
            res.json({ promo })
        })
}
//read data
const read = async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const search = req.query.search;
    const startIndex = (page - 1) * limit;

    const result = {};
    try {
        let promo = []
        result.results = await Promotions.find({
            city_target: { $regex: search, $options: 'i' }
        }, function (err, result) {
            if (err) {
                res.send(err.message)
            } else {
                promo = result.map((element) => {
                    const temp = element
                    temp.created_at =
                    {
                        mili: temp.created_at,
                        micro: temp.created_at * 1000
                    }
                    temp.updated_at =
                    {
                        mili: temp.updated_at,
                        micro: temp.updated_at * 1000
                    }
                    return temp
                })
                res.send(promo)
            }
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
        type: check.string().required(),
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
    try {
        Descriptions.findOne({ title: req.body.title },
            async function (err, promotions) {
                if (err) {
                    res.status(500).send({ message: err });
                } if (promotions) {
                    res.status(500).send({ message: req.body.title + " was already added!" });
                } else {
                    //req for file
                    const filePath = req.files;

                    //upload media
                    const covUrl = await uploadDrive(filePath.cover[0])
                    const content = await uploadDrive(filePath.content[0])

                    //get link to save on database Mongo
                    const urlCov = covUrl.data.webViewLink;
                    const urlContent = content.data.webViewLink;

                    fs.emptyDirSync('./uploads');
                    //get value of description from req.body
                    const newDes = new Descriptions({
                        title: req.body.title,
                        name: req.body.name,
                        caption: req.body.caption,
                        content: urlContent,
                        type: req.body.type
                    })

                    //get value of promotion from req.body
                    const newProm = new Promotions({
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
                        status: req.body.status.toUpperCase(),
                        created_at: Date.now(),
                        updated_at: Date.now(),
                    })

                    //save data to database
                    newProm.save(function (err, result) {
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
    Promotions.findOne({ _id: req.params.id })
        .then(async data => {
            // store media to database
            async function toDatabase(urlContent, urlCover) {
                //description table data
                var dataDes = []
                //condition when update a content
                if (urlContent) {
                    dataDes = {
                        title: req.body.title,
                        name: req.body.name,
                        caption: req.body.caption,
                        content: urlContent,
                        type: req.body.type
                    }
                } else {
                    dataDes = {
                        title: req.body.title,
                        name: req.body.name,
                        caption: req.body.caption,
                        type: req.body.type
                    }
                }
                const newDes = await Descriptions.updateOne({ description_id: data.description_id.toString() }, dataDes);

                //promotions table
                var dataPromo = []
                if (urlCover) {
                    dataPromo = {
                        title: req.body.title,
                        name: req.body.name,
                        caption: req.body.caption,
                        category_id: req.body.category_id,
                        cover_url: urlCover,
                        creator_id: req.body.creator_id,
                        description_id: newDes._id,
                        province_target: req.body.province_target,
                        city_target: req.body.city_target,
                        rejected_message: req.body.rejected_message,
                        reviewer_id: req.body.reviewer_id,
                        status: req.params.status.toUpperCase(),
                        updated_at: Date.now()
                    }
                } else {
                    dataPromo = {
                        title: req.body.title,
                        name: req.body.name,
                        caption: req.body.caption,
                        category_id: req.body.category_id,
                        creator_id: req.body.creator_id,
                        description_id: newDes._id,
                        province_target: req.body.province_target,
                        city_target: req.body.city_target,
                        rejected_message: req.body.rejected_message,
                        reviewer_id: req.body.reviewer_id,
                        status: req.params.status.toUpperCase(),
                        updated_at: Date.now()
                    }
                }
                const result = await Promotions.updateOne(dataPromo);
            };

            //req for file
            const filePath = req.files;
            var urlCont = "";
            var urlCov = "";

            if (Object.keys(filePath).length === 0) {
                const result = toDatabase(urlCont, urlCov)
                if (result) {
                    res.send({ message: 'Updated without media selected success!' })
                }
            } else {
                const idCov = getId(data.cover_url);
                const covUrl = await updateDrive(filePath.cover[0], idCov);
                urlCov = covUrl.data.webViewLink;


                Descriptions.findOne({ _id: data.description_id.toString() })
                    .then(async (data) => {
                        const idCont = getId(data.content);
                        const content = await updateDrive(filePath.content[0], idCont);
                        urlCont = content.data.webViewLink;
                    })

                const result = toDatabase(urlCont, urlCov)

                fs.emptyDirSync('./uploads');
                if (result) {
                    res.send({ message: 'Updated successfully' })
                }
            }
        })
        .catch(err => {
            console.log(err)
            res.send({ message: err });
        });
}

//deleting data
const deleting = async (req, res) => {
    const idData = req.params.id;
    daleteMedia(idData);
    deleteDes(idData);
    Promotions.deleteOne({ _id: idData },
        (err) => {
            if (err) {
                res.send({ message: err });
            } else
                res.send({ message: "Promotion deleted!" });
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