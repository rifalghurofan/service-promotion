const Promotions = require('../models/promotions')
const Descriptions = require('../models/descriptions')
const { uploadFirebase } = require("../utils/firebase");
require("dotenv").config();

//update data
const editPromosi = async (req, res) => {
    Promotions.findOne({ _id: req.params.id })
        .then(async data => {
            const lastDat = await Descriptions.findOne({ _id: data.description_id.toString() }).then(dataLast => {
                return dataLast;
            })
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
                    status: 'DRAFT',
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
                //upload file to firebase storage
                const uploadCn = await uploadFirebase(filePath.content[0])
                const uploadCv = await uploadFirebase(filePath.cover[0])

                //get url of file
                urlContent = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${uploadCn}`;
                urlCover = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${uploadCv}`;

                //send url to mongoo database
                up(urlContent, urlCover)
                res.send({ message: 'Updated successfully' })
            }
        })
        .catch(err => {
            res.status(500).send(err.message);
        });
}
module.exports = { editPromosi }