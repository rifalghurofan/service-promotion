const Promotions = require("../models/promotions");
const { admin } = require("../utils/firebase");
const storageRef = admin.storage().bucket();
require("dotenv").config();

const uploadCover = async (req, res) => {
    // foreach for handle multiple media
    const { id } = req.params;
    const file = req.file;

    let urlCov = "";

    await storageRef
        .file(file.path)
        .getSignedUrl({
            action: "read",
            expires: "03-09-2491",
        })
        .then((result) => {
            urlCov = result[0];
        })
        .catch((err) => {
            console.log(err);
        });

    await Promotions.findOneAndUpdate(
        { _id: id },
        { $set: { cover_url: urlCov } },
        { new: true }
    ).then((data) => {
        res.status(200).json({
            status: "OK",
            message: "Uploaded",
            data: data,
        });
    });
};

module.exports = { uploadCover };
