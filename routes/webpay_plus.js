var express = require("express");
var router = express.Router();
var webpay_plus_controller = require("../controllers/webpay_plus");
const WebpayPlus = require("transbank-sdk").WebpayPlus;

router.use(function (req, res, next) {
  WebpayPlus.configureWebpayPlusForTesting();
  next();
});

router.get("/create", webpay_plus_controller.create);

module.exports = router;
