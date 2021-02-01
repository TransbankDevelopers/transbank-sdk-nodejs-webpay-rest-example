var express = require("express");
var router = express.Router();
var webpayPlusMallDeferredController = require("../controllers/webpay_plus_mall_deferred");
const WebpayPlus = require("transbank-sdk").WebpayPlus;

router.use(function (req, res, next) {
  WebpayPlus.configureWebpayPlusMallDeferredForTesting();
  next();
});

router.get("/create", webpayPlusMallDeferredController.create);

router.post("/commit", webpayPlusMallDeferredController.commit);

router.post("/capture", webpayPlusMallDeferredController.capture);

router.post("/status", webpayPlusMallDeferredController.status);

router.post("/refund", webpayPlusMallDeferredController.refund);

module.exports = router;
