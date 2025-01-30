var express = require("express");
var router = express.Router();
var controller = require("../controllers/oneclick_mall_bin");


router.get("/start", controller.start);
router.get("/finish", controller.finish);
router.post("/finish", controller.finish);
router.post("/delete", controller.delete);
router.post("/authorize", controller.authorize);
router.post("/status", controller.status);
router.post("/refund", controller.refund);
router.post("/bin", controller.bin);

module.exports = router;
