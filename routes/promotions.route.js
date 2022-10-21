// const multer = require('multer');
// const upload = multer({ dest: "./uploads" })
const upload = require('../utils/firebase')
const controller = require('../controllers/promotions.controller');

module.exports = function (app) {
    app.get('/', controller.getAll);//get all data promotions
    app.get('/promotions', controller.read);
    app.get('/promotions/view/:id', controller.viewOne);//get one for viewing promotions
    app.get('/promotions/link/:id', controller.click);//get clicked linked property
    app.get('/promotions/like/:id', controller.likeOne);//get like for promotions

    // app.post('/file', upload.multer.single('file'), (req, res) => {
    //     res.status(201).json(req.file)
    // })

    app.post('/promotions/create', upload.multer.fields([
        { name: 'cover', maxCount: 1 },
        { name: 'content', maxCount: 1 }
    ]), controller.create);

    app.put('/promotions/update/:id&:status', upload.multer.fields([
        { name: 'cover', maxCount: 1 },
        { name: 'content', maxCount: 1 }
    ]), controller.updating);

    app.delete('/promotions/delete/:id', controller.deleting);


}