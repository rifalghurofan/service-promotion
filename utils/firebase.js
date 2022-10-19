const Multer = require('multer')
const Admin = require('firebase-admin')
const FirebaseStorage = require('multer-firebase-storage')
const config = require('../config/serviceAccountKey.json')
const Promotions = require('../models/promotions');
const Descriptions = require('../models/descriptions');
require('dotenv');

Admin.initializeApp({
    credential: Admin.credential.cert(config),
    storageBucket: process.env.BUCKET_NAME
})

const bucket = Admin.storage().bucket()

const multer = Multer({
    storage: FirebaseStorage({
        bucketName: process.env.BUCKET_NAME,
        credentials: {
            clientEmail: config.client_email,
            privateKey: config.private_key,
            projectId: config.project_id
        },
        public: true
    })
})

const deleteMedia = (id) => {
    //delete media in promotion
    Promotions.findOne({ _id: id })
        .then(dataProm => {
            const filename = dataProm.cover_url.replace('https://storage.googleapis.com/zeta-period-360919.appspot.com/', '')
            bucket.file(filename).delete()
                .then(() => {
                    console.log('Cover deleted!')
                })
                .catch(err => {
                    console.log('Cover Not found!');
                });

            //delete media in descripion
            Descriptions.findOne({ _id: dataProm.description_id })
                .then(dataDes => {
                    const filename = dataDes.content.replace('https://storage.googleapis.com/zeta-period-360919.appspot.com/', '')
                    bucket.file(filename).delete()
                        .then(() => {
                            console.log('Content deleted!')
                        })
                        .catch(err => {
                            console.log('Content Not found!');
                        });
                })

        })
        .catch(err => {
            console.log(err || 'Data Not found!');
        });
}

module.exports = {
    multer,
    deleteMedia
} 
