const { uploadFirebase } = require('../utils/firebase');
require("dotenv").config();


const upload = async (req, res) => {
    // foreach for handle multiple media
    const filePath = req.files;
    let urlContent;
    // foreach
    if (filePath.length == 1) {
        const uploadCn = await uploadFirebase(filePath[0]);
        const urlCont = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${uploadCn}`;
        urlContent = urlCont;
    }
    else {
        urlContent = []
        filePath.forEach(async (element) => {
            const uploadCn = await uploadFirebase(element);
            const urlCont = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${uploadCn}`;
            urlContent.push(urlCont);
        })
    }
    // wait till foreach done
    setTimeout(() => {
        res.send({ message: 'Uploaded successfully!', data: urlContent })
    }, 1000);
}

module.exports = { upload };

