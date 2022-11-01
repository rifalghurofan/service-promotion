const Promotions = require("../models/promotions");
const Descriptions = require("../models/descriptions");
const check = require('joi');
const { uploadFirebase } = require("../utils/firebase");
require("dotenv").config();

//create data
const simpanDraftPromosi = async (req, res) => {
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
        res.send({ message: error });
    }
}

module.exports = { simpanDraftPromosi }