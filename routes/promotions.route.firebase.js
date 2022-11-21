// const multer = require("multer");
// const upload = multer({ storage: multer.memoryStorage() });
const { upload } = require("../utils/firebase");
const controller = require("../controllers/promotions.controller");
const simpan = require("../controllers/simpanDraftPromosi");
const publish = require("../controllers/terbitkan");
const Upload = require("../controllers/uploadCover");

module.exports = function (app) {
    app.get("/getPromotions", controller.getPromotions); //get all data promotions
    app.get("/getPromotion/:id", controller.viewOne);
    app.get("/terbitkan/:id", publish.terbitkan); //terbitkan
    app.post("/addPromotion", controller.addPromotion);
    app.post("/uploadCover/:id", upload.single("cover"), Upload.uploadCover);
    app.put("/updatePromotion/:id", controller.updatePromotion);
    app.delete("/deletePromotion/:id", controller.deletePromotion);
};
