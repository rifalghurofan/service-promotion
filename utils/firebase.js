const config = require("../config/serviceAccountKey.json");
const fbadmin = require("firebase-admin");
const Multer = require("multer");
const { uid } = require("uid");
const path = require("path");
const fs = require("fs");
require("dotenv");

const admin = fbadmin.initializeApp({
    credential: fbadmin.credential.cert(config),
    storageBucket: process.env.BUCKET_NAME,
});

const multerStorage = Multer.diskStorage({
    destination: function (req, file, callback) {
        const pathCover = "./public/cover";
        fs.mkdirSync(pathCover, { recursive: true });
        callback(null, pathCover);
    },
    filename: function (req, file, callback) {
        callback(null, uid(32) + path.extname(file.originalname));
    },
});

module.exports = {
    admin,
    multerStorage,
};
