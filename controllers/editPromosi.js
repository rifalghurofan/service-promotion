const Promotions = require('../models/promotions');
const { uploadFirebase } = require("../utils/firebase");
require("dotenv").config();

//update data
const editPromosi = async (req, res) => {
    Promotions.findOne({ _id: req.params.id })
        .then(async data => {
            //description table data
            const filePath = req.files;
            var urlCover = []

            async function up(urlCov) {
                var dataPromo = []

                let status;
                // check if publish is in query key
                if ('ACTIVE' in req.query) {
                    status = 'ACTIVE'
                } else if ('PENDING' in req.query) {
                    status = 'PENDING'
                } else if ('REJECTED' in req.query) {
                    status = 'REJECTED'
                } else if ('ARCHIVED' in req.query) {
                    status = 'ARCHIVED';
                } else if ('DELETED' in req.query) {
                    status = 'DELETED';
                } else {
                    status = 'HIDE'
                }
                const { description = data.description, title = data.title, name = data.name, caption = data.caption, category_id = data.category_id, cover_url = data.cover_url, creator = data.creator, province_target = data.province_target, city_target = data.city_target, rejected_message = data.rejected_message, reviewer_id = data.reviewer_id } = re.body;

                dataPromo = {
                    title: title,
                    name: name,
                    caption: caption,
                    category_id: category_id,

                    description: description,
                    cover_url: urlCov,
                    creator: creator,
                    province_target: province_target,
                    city_target: city_target,
                    rejected_message: rejected_message,
                    reviewer_id: reviewer_id,
                    status: status,
                    updated_at: Date.now()
                }
                await Promotions.updateOne({ _id: req.params.id }, dataPromo);
            }

            if (filePath == undefined) {
                urlCover = data.cover_url

                up(urlCover)
                res.send({ message: 'Updated successfully with no media selected!' })
            } else {
                //upload file to firebase storage
                const uploadCv = await uploadFirebase(filePath.cover[0])

                //get url of file
                urlCover = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${uploadCv}`;

                //send url to mongoo database
                up(urlCover)
                res.send({ message: 'Updated successfully' })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).send(err.message);
        });
}
module.exports = { editPromosi }