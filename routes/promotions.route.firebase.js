const Multer = require("multer");
const { multerStorage } = require("../utils/firebase");
const upload = Multer({ storage: multerStorage });
const controller = require("../controllers/promotions.controller");

module.exports = function (app) {
    app.get("/promotionService/muatKelolaPromosi", controller.muatKelolaPromosi);
    app.get("/promotionService/detailPromosi/:id", controller.detailPromosi);
    app.get("/promotionService/cariPromosi", controller.cariPromosi);
    app.patch("/promotionService/editPromosi/:id", controller.editPromosi);
    app.post("/promotionService/tambahPromosi", controller.tambahPromosi);
    app.post(
        "/promotionService/uploadFilePromosi",
        upload.single("gambar"),
        controller.uploadFilePromosi
    );
    app.delete("/promotionService/deletePromosi/:id", controller.deletePromosi);
};
