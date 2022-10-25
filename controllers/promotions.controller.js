const redis = require('@redis/search')
const Promotions = require("../models/promotions");
const Descriptions = require("../models/descriptions");
const check = require('joi');
const { uploadFirebase, deleteMedia } = require("../utils/firebase");
require("dotenv").config();

const search = async (req, res) => {
    await Promotions.ft.search('name:stories')
        .then(result => {
            res.send(result)
        })
}

//get all data without paginations
const dataPromosi = async (req, res) => {
    let promotion = []
    Promotions.find({}).populate('description_id')
        .then(data => {
            promotion = data.map((element) => {
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
            res.json(promotion)
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
                    if (Object.keys(req.files).length === 0) {
                        return res.send({ message: 'no media selected!' })
                    } else {
                        const filePath = req.files;
                        //upload to firebase
                        const uploadCv = await uploadFirebase(filePath.cover[0])
                        const uploadCn = await uploadFirebase(filePath.content[0])

                        const urlCov = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${uploadCv}`;
                        const urlCont = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${uploadCn}`;

                        const newDes = new Descriptions({
                            title: req.body.title,
                            name: req.body.name,
                            caption: req.body.caption,
                            content: urlCont,
                            type: req.body.type.toUpperCase()
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
                            status: 'DRAFT',
                            created_at: Date.now(),
                            updated_at: Date.now(),
                        })

                        // save data to database
                        newProm.save(function (err, result) {
                            if (err) {
                                return res.status(500).send(err.message);
                            } else {
                                newDes.save()
                                res.status(500).send({ result });
                            }
                        })
                    }
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
            const lastDat = await Descriptions.findOne({ _id: data.description_id.toString() }).then(dataLast => {
                return dataLast;
            })

            // store media to database
            //description table data
            const filePath = req.files;
            var urlContent = []
            var urlCover = []

            async function up(urlCont, urlCov) {
                var dataDes = []
                var dataPromo = []

                dataDes = {
                    title: req.body.title,
                    name: req.body.name,
                    caption: req.body.caption,
                    content: urlCont,
                    type: req.body.type.toUpperCase()
                }
                const newDes = await Descriptions.updateOne({ _id: data.description_id.toString() }, dataDes);

                dataPromo = {
                    title: req.body.title,
                    name: req.body.name,
                    caption: req.body.caption,
                    category_id: req.body.category_id,
                    cover_url: urlCov,
                    creator_id: req.body.creator_id,
                    description_id: data.description_id.toString(),
                    province_target: req.body.province_target,
                    city_target: req.body.city_target,
                    rejected_message: req.body.rejected_message,
                    reviewer_id: req.body.reviewer_id,
                    status: req.params.status.toUpperCase(),
                    updated_at: Date.now()
                }
                const newProm = await Promotions.updateOne(dataPromo);
            }

            if (Object.keys(filePath).length === 0) {
                urlContent = lastDat.content
                urlCover = data.cover_url

                up(urlContent, urlCover)
                res.send({ message: 'Updated successfully with no media selected!' })
            } else {
                const uploadCn = await uploadFirebase(filePath.content[0])
                const uploadCv = await uploadFirebase(filePath.cover[0])

                urlContent = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${uploadCn}`;
                urlCover = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${uploadCv}`;

                up(urlContent, urlCover)
                res.send({ message: 'Updated successfully' })
            }
        })
        .catch(err => {
            res.status(500).send(err.message);
        });
}

//deleting data
const deleting = async (req, res) => {
    const idData = req.params.id;
    Promotions.findOne({ _id: idData })
        .then(data => {
            if (data) {
                deleteMedia(idData);
                Promotions.deleteOne({ _id: idData })
                    .then(() => {
                        res.send({ message: 'Deleted Succesfully!' })
                    })
                    .catch(err => {
                        res.send(err || { message: 'Not found!' });
                    });

            } else {
                res.send({ message: 'Promotions not found!' })
            }
        })
};

module.exports = {
    search,
    dataPromosi,
    read,
    viewOne,
    click,
    likeOne,
    create,
    updating,
    deleting
}