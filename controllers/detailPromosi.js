const Promotions = require('../models/promotions')
const Descriptions = require('../models/descriptions')

const detailPromosi = async (req, res) => {
    Promotions.findOne({ _id: req.params.id })
        .populate('description_id')
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send(err.message);
        });
}
module.exports = { detailPromosi }