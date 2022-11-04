const Promotions = require('../models/promotions')

const detailPromosi = async (req, res) => {
    await Promotions.findOne({ _id: req.params.id })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send(err.message);
        });
}
module.exports = { detailPromosi }