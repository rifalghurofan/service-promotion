const Promotions = require('../models/promotions')

const cariPromosi = async (req, res) => {
    const search = req.query.search;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;

    const result = {};
    try {
        let promo = []
        result.results = await Promotions.find({
            name: { $regex: search, $options: 'i' }
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
            }
        }).clone().populate('description_id').limit(limit).skip(startIndex);
        res.send({
            data: promo,
            page: page,
            limit: limit
        });
    } catch (err) {
        res.send({ message: err.message })
    }
};
module.exports = { cariPromosi }