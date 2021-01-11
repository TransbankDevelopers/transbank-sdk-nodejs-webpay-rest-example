var express = require("express");
var router = express.Router();
var webpay_plus_controller = require("../controllers/webpay_plus");
const WebpayPlus = require("transbank-sdk").WebpayPlus;

router.use(function (req, res, next) {
  WebpayPlus.configureWebpayPlusForTesting();
  next();
});

router.get("/create", webpay_plus_controller.create);

router.post("/commit", webpay_plus_controller.commit);

router.post("/status", webpay_plus_controller.status);

router.post("/refund", webpay_plus_controller.refund);

module.exports = router;
