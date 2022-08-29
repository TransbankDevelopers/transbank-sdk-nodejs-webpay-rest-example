var express = require("express");
var router = express.Router();
var controller = require("../controllers/webpay_plus");
const WebpayPlus = require("transbank-sdk").WebpayPlus;

router.use(function (req, res, next) {
  if (process.env.WPP_CC && process.env.WPP_KEY) {
    WebpayPlus.configureForProduction(process.env.WPP_CC, process.env.WPP_KEY);
  } else {
    WebpayPlus.configureForTesting();
  }
  next();
});

router.get("/create", controller.create);
router.get("/commit", controller.commit);
router.post("/commit", controller.commit);
router.post("/status", controller.status);
router.post("/refund", controller.refund);

module.exports = router;
