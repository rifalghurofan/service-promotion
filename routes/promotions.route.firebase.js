const Multer = require("multer");
const { multerStorage } = require("../utils/firebase");
const upload = Multer({ storage: multerStorage });
const controller = require("../controllers/promotions.controller");

module.exports = function (app) {
    app.get("/muatKelolaPromosi", controller.muatKelolaPromosi);
    app.get("/detailPromosi/:id", controller.detailPromosi);
    app.get("/cariPromosi", controller.cariPromosi);
    app.put("/editPromosi/:id", controller.editPromosi);
    app.post("/tambahPromosi", controller.tambahPromosi);
    app.post(
        "/uploadFilePromosi",
        upload.single("cover"),
        controller.uploadFilePromosi
    );
};
