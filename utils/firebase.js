const Multer = require('multer')
const admin = require('firebase-admin')
const FirebaseStorage = require('multer-firebase-storage')
const config = require('../config/serviceAccountKey.json')
const Promotions = require('../models/promotions');
const Descriptions = require('../models/descriptions');
const saltedMd5 = require('salted-md5');
const path = require('path');
require('dotenv');

admin.initializeApp({
    credential: admin.credential.cert(config),
    storageBucket: process.env.BUCKET_NAME
})

const bucket = admin.storage().bucket()

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

const uploadFirebase = (filePath) => {
    const name = saltedMd5(filePath.originalname, 'SUPER-S@LT!')
    const fileName = name + path.extname(filePath.originalname)
    bucket.file(fileName).createWriteStream().end(filePath.buffer)
    return fileName;
}

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
                    Descriptions.deleteOne({ _id: dataProm.description_id })
                        .then(() => {
                            console.log('Descriptions deleted!')
                        })
                        .catch(err => {
                            console.log('Descriptions Not found!');
                        });
                })

        })
        .catch(err => {
            console.log(err || 'Data Not found!');
        });
}

module.exports = {
    multer,
    uploadFirebase,
    deleteMedia
} 
