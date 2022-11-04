const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() })
const controller = require('../controllers/promotions.controller');
const simpan = require('../controllers/simpanDraftPromosi');
const publish = require('../controllers/terbitkan');
const edit = require('../controllers/editPromosi');
const cari = require('../controllers/cariPromosi')

module.exports = function (app) {
    app.get('/', controller.dataPromosi);//get all data promotions

    app.get('/', cari.cariPromosi);

    app.get('/view/:id', controller.viewOne);//get one for viewing promotions

    app.get('/click/:id', controller.click);//get clicked linked property

    app.get('/like/:id', controller.likeOne);//get like for promotions

    app.get('/terbitkan/:id', publish.terbitkan);//terbitkan

    app.post('/simpanDraftPromosi',
        upload.fields([
            { name: 'cover', maxCount: 1 },
            { name: 'content', maxCount: 1 }
        ]), simpan.simpanDraftPromosi);

    app.put('/editPromosi/:id',
        upload.fields([
            { name: 'cover', maxCount: 1 },
            { name: 'content', maxCount: 1 }
        ]), edit.editPromosi);

    app.delete('/delete/:id', controller.deleting);
    app.get('/search', controller.search);

}