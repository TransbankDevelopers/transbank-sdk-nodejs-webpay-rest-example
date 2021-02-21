var express = require("express");
var router = express.Router();
var webpayPlusController = require("../controllers/webpay_plus");
const WebpayPlus = require("transbank-sdk").WebpayPlus;

router.use(function (req, res, next) {
  if (process.env.WPP_CC && process.env.WPP_KEY) {
    WebpayPlus.configureForProduction(process.env.WPP_CC, process.env.WPP_KEY);
  } else {
    WebpayPlus.configureWebpayPlusForTesting();
  }
  next();
});

router.get("/create", webpayPlusController.create);
router.post("/commit", webpayPlusController.commit);
router.post("/status", webpayPlusController.status);
router.post("/refund", webpayPlusController.refund);

module.exports = router;
