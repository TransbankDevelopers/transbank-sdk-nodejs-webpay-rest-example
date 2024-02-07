var express = require("express");
var router = express.Router();
var controller = require("../controllers/webpay_plus_mall_deferred");
const WebpayPlus = require("transbank-sdk").WebpayPlus;

router.use(function (req, res, next) {
  if (process.env.WPPMD_CC && process.env.WPPMD_KEY) {
    WebpayPlus.configureForProduction(
      process.env.WPPMD_CC,
      process.env.WPPMD_KEY
    );
  } else {
    WebpayPlus.configureForTestingMallDeferred();
  }
  next();
});

router.get("/create", controller.create);
router.get("/commit", controller.commit);
router.post("/commit", controller.commit);
router.post("/capture", controller.capture);
router.post("/status", controller.status);
router.post("/refund", controller.refund);

module.exports = router;
