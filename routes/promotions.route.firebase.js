const express = require("express");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() })
const controller = require('../controllers/promotions.controller');

const compression = require('compression')
const saltedMd5 = require('salted-md5');
const path = require('path');

module.exports = function (app) {
    app.get('/', controller.getAll);//get all data promotions
    app.get('/promotions', controller.read);
    app.get('/promotions/view/:id', controller.viewOne);//get one for viewing promotions
    app.get('/promotions/link/:id', controller.click);//get clicked linked property
    app.get('/promotions/like/:id', controller.likeOne);//get like for promotions

    // app.post('/promotions/create', upload.fields([
    //     { name: 'cover', maxCount: 1 },
    //     { name: 'content', maxCount: 1 }
    // ]), controller.create);

    app.put('/promotions/update/:id&:status', upload.fields([
        { name: 'cover', maxCount: 1 },
        { name: 'content', maxCount: 1 }
    ]), controller.updating);
    app.delete('/promotions/delete/:id', controller.deleting);


    // view engine setup
    app.set('views', path.join(__dirname, 'static', 'views'))
    app.set('view engine', 'ejs')
    app.use(compression())
    app.use('/public', express.static(path.join(__dirname, 'static', 'public')))

    var admin = require("firebase-admin");
    var serviceAccount = require("../config/serviceAccountKey.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.BUCKET_URL
    });

    app.locals.bucket = admin.storage().bucket()

    app.post('/upload', upload.single('file'), async (req, res) => {
        const name = saltedMd5(req.file.originalname, 'SUPER-S@LT!')
        const fileName = name + path.extname(req.file.originalname)
        await app.locals.bucket.file(fileName).createWriteStream().end(req.file.buffer)
        res.send('done');
    })
}