const controller = require('./promotions.controller')
const Promotions = require('../models/promotions')
const Descriptions = require('../models/descriptions')

const terbitkan = (req, res) => {
    //function for generate expired time
    const secondsToMidnight = (n) => {
        return (
            ((24 - n.getHours() - 1) * 60 * 60) + ((60 - n.getMinutes() - 1) * 60) + (60 - n.getSeconds())
        )
    }
    const currentTime = new Date()
    const expiry = currentTime.getTime() + (secondsToMidnight(currentTime) * 1000)

    //find data and update field status and expired_at from promotion table
    Promotions.findOneAndUpdate({ _id: req.params.id }, {
        $set: {
            status: 'PUBLISHED',
            expired_at: expiry
        }
    }).then(() => {
        //find again updated data promotions
        Promotions.findOne({ _id: req.params.id }).populate('description_id').then(result => {
            res.send({
                message: 'Promotions has been published!',
                Promotions: result
            });
        })
    }).catch(err => {
        res.status(500).send(err.message);
    });
}

module.exports = { terbitkan }