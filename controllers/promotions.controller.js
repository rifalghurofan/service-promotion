const Promotions = require("../models/promotions");
const check = require('joi');

//read data
const read = async (req, res) => {
    Promotions.find({})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send(err.message);
        });
};
//create data
const create = async (req, res) => {
    //validations
    const Schema = check.object({
        title: check.string().required(),
        name: check.string().required(),
        caption: check.string().required(),
        category_id: check.string().required(),
        cover_url: check.string().required(),
        creator_id: check.string().required(),
        description: check.string().required(),
        province_target: check.string().required(),
        city_taget: check.string().required(),
        rejected_message: check.string().required(),
        reviewer_id: check.string().required(),
        status: check.string().required(),
        total_clicks: check.string().required(),
        total_views: check.string().required()
    }).required();
    const { error } = Schema.validate(req.body)
    if (error) {
        return res.send(error.message);
    }
    Promotions.findOne({ title: req.body.title },
        function (err, promotions) {
            if (err) {
                res.status(500).send(err.message);
            } if (promotions) {
                res.status(500).send(req.body.title + " was already added!");
            } else {
                const create = new Promotions({
                    title: req.body.title,
                    name: req.body.name,
                    caption: req.body.caption,
                    category_id: req.body.category_id,
                    cover_url: req.body.cover_url,
                    creator_id: req.body.creator_id,
                    description: req.body.description,
                    province_target: req.body.province_target,
                    city_taget: req.body.city_taget,
                    rejected_message: req.body.rejected_message,
                    reviewer_id: req.body.reviewer_id,
                    status: req.body.status,
                    total_clicks: req.body.total_clicks,
                    total_views: req.body.total_views
                });

                create.save(function (err, result) {
                    if (err) {
                        res.status(500).send(err.message);
                        return;
                    } else {
                        res.status(500).send('Promotions data created! ' + result);
                    }
                })
            }
        }
    )
};
//update data
const updating = async (req, res) => {
    const Schema = check.object().keys({
        title: check.string().required().min(1)
    }).required();
    const { error } = Schema.validate(req.body)
    if (error) {
        return res.send(err.message);
    }
    Promotions.findOneAndUpdate(
        { _id: req.params.id }, {
        $set: {
            title: req.body.title,
            name: req.body.name,
            caption: req.body.caption,
            category_id: req.body.category_id,
            cover_url: req.body.cover_url,
            creator_id: req.body.creator_id,
            description: req.body.description,
            province_target: req.body.province_target,
            city_taget: req.body.city_taget,
            rejected_message: req.body.rejected_message,
            reviewer_id: req.body.reviewer_id,
            status: req.body.status,
            total_clicks: req.body.total_clicks,
            total_views: req.body.total_views
        },
    },
        { new: true },
        (err, result) => {
            if (err) {
                res.send(err);
            } else
                res.send("Promotions data updated!" + result);
        }
    );
};
//deleting data
const deleting = async (req, res) => {
    const Schema = check.object().keys({
        title: check.string().required()
    });
    const { error } = Schema.validate(req.body)
    if (error) {
        return res.send(error.message);
    }
    Promotions.deleteOne(
        { title: req.body.title },
        (err, result) => {
            if (err) {
                res.send(err.message);
            } else
                res.send(result);
        }
    );
};

module.exports = {
    read,
    create,
    updating,
    deleting
}