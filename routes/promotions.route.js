const multer = require('multer');
const upload = multer({ dest: "./uploads" })
const controller = require('../controllers/promotions.controller');

module.exports = function (app) {
    app.get('/', controller.read);
    app.get('/promotions/:id', controller.readOne);
    app.post('/promotions/create', upload.fields([{ name: 'cover', maxCount: 1 }]), controller.create);
    app.put('/promotions/update/:id', upload.fields([{ name: 'cover', maxCount: 1 }]), controller.updating);
    app.delete('/promotions/delete/:id', controller.deleting);
}