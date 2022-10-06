const fs = require('fs');
const driveAuth = require("../config/driveAuth");
require("dotenv").config();

const uploadDrive = async (filePath) => {
    //rename uploaded file with the original file from request
    const rename = await fs.promises.rename(
        filePath.destination + "/" + filePath.filename,
        filePath.destination + "/" + filePath.originalname
    )

    //name file for uploadet to Gdrive
    const metaData = {
        name: filePath.originalname.substring(0, filePath.originalname.lastIndexOf(".")),
        parents: [process.env.FOLDER_ID] // the ID of the folder you get is used here
    };

    //type data of file same with the original type data
    const mediaData = {
        mimeType: filePath.mimeType,
        body: fs.createReadStream(filePath.destination + "/" + filePath.originalname) // the filePath sent through multer will be uploaded to Drive
    };

    //func for uploaded file to Gdrive
    const response = await driveAuth.files.create({//create image in the drive
        resource: metaData,
        media: mediaData,
        fields: 'id'
    });

    //func for get url gdrive file
    const fileId = response.data.id;
    const getUrl = await driveAuth.files.get({
        fileId: fileId,
        fields: 'webViewLink'
    })
    return getUrl;
}

const updateDrive = async (filePath, getFileId) => {
    //rename uploaded file with the original file from request
    await fs.promises.rename(
        filePath.destination + "/" + filePath.filename,
        filePath.destination + "/" + filePath.originalname
    )

    //type data of file same with the original type data
    const mediaData = {
        mimeType: filePath.mimeType,
        body: fs.createReadStream(filePath.destination + "/" + filePath.originalname) // the filePath sent through multer will be uploaded to Drive
    };

    //func for uploaded file to Gdrive
    // console.log(getFileId)
    const response = await driveAuth.files.update({//create image in the drive
        resource: { name: filePath.originalname },
        addParents: `${process.env.FOLDER_ID}`,
        fileId: getFileId,
        media: mediaData,
        fields: 'id'
    });

    //func for get url gdrive file
    const fileId = response.data.id
    const getUrl = await driveAuth.files.get({
        fileId: fileId,
        fields: 'webViewLink'
    })
    return getUrl;
}

const getId = (dataId) => {
    const idPick = dataId.replace('https://drive.google.com/file/d/', '');
    const idPick2 = idPick.replace('/view?usp=drivesdk', '');
    return idPick2;
}

const daleteMedia = async (data, res) => {
    Stories.findOne({ _id: data })
        .then(data => {
            // console.log(await getIdDelete(id))
            const response = (fileId) => {
                driveAuth.files.delete({
                    fileId: fileId,
                    parentId: `${process.env.FOLDER_ID}`,
                })
            }
            // console.log(data)
            const idThumb = getId(data.thumbnail_url);
            const idCov = getId(data.cover_url);

            response(idThumb)
            response(idCov)

            console.log('Updated successfully!')
        })
        .catch(err => {
            console.log(err.message);
        });
}

module.exports = {
    uploadDrive,
    updateDrive,
    getId,
    daleteMedia
};