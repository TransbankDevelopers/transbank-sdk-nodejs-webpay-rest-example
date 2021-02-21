var express = require("express");
var router = express.Router();
var webpayPlusController = require("../controllers/webpay_plus_mall");
const WebpayPlus = require("transbank-sdk").WebpayPlus;

router.use(function (req, res, next) {
  if (process.env.WPPM_CC && process.env.WPPM_KEY) {
    WebpayPlus.configureForProduction(
      process.env.WPPM_CC,
      process.env.WPPM_KEY
    );
  } else {
    WebpayPlus.configureWebpayPlusMallForTesting();
  }
  next();
});

router.get("/create", webpayPlusController.create);

router.post("/commit", webpayPlusController.commit);

router.post("/status", webpayPlusController.status);

router.post("/refund", webpayPlusController.refund);

module.exports = router;
