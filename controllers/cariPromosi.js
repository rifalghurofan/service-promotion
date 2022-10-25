const Promotions = require('../models/promotions')

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