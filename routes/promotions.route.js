const controller = require('../controllers/promotions.controller');

module.exports = function (app) {
    app.get('/promotions', controller.read);
    app.post('/promotions/create', controller.create);
    app.put('/promotions/update', controller.updating);
    app.delete('/promotions/update', controller.deleting);
}