const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() })
const controller = require('../controllers/promotions.controller');
const simpan = require('../controllers/simpanDraftPromosi');
const publish = require('../controllers/terbitkan');
const edit = require('../controllers/editPromosi');

module.exports = function (app) {
    app.get('/', controller.dataPromosi);//get all data promotions

    app.get('/promotions', controller.read);

    app.get('/promotions/view/:id', controller.viewOne);//get one for viewing promotions

    app.get('/promotions/link/:id', controller.click);//get clicked linked property

    app.get('/promotions/like/:id', controller.likeOne);//get like for promotions

    app.get('/promotions/publish/:id', publish.terbitkan);//terbitkan

    app.post('/promotions/draft',
        upload.fields([
            { name: 'cover', maxCount: 1 },
            { name: 'content', maxCount: 1 }
        ]), simpan.simpanDraftPromosi);

    app.put('/promotions/edit/:id',
        upload.fields([
            { name: 'cover', maxCount: 1 },
            { name: 'content', maxCount: 1 }
        ]), edit.editPromosi);

    app.delete('/promotions/delete/:id', controller.deleting);
    app.get('/promotions/search', controller.search);

}