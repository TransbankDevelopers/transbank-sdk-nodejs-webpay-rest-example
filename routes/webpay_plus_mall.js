var express = require("express");
var router = express.Router();
var controller = require("../controllers/webpay_plus_mall");
const WebpayPlus = require("transbank-sdk").WebpayPlus;

router.use(function (req, res, next) {
  if (process.env.WPPM_CC && process.env.WPPM_KEY) {
    WebpayPlus.configureForProduction(
      process.env.WPPM_CC,
      process.env.WPPM_KEY
    );
  } else {
    WebpayPlus.configureForTestingMall();
  }
  next();
});

router.get("/create", controller.create);
router.get("/commit", controller.commit);
router.post("/commit", controller.commit);
router.post("/status", controller.status);
router.post("/refund", controller.refund);

module.exports = router;
