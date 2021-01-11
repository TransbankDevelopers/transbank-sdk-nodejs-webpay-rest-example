var express = require("express");
var router = express.Router();
var webpayPlusDeferredController = require("../controllers/webpay_plus_deferred");
const WebpayPlus = require("transbank-sdk").WebpayPlus;

router.use(function (req, res, next) {
  WebpayPlus.configureWebpayPlusDeferredForTesting();
  next();
});

router.get("/create", webpayPlusDeferredController.create);

router.post("/commit", webpayPlusDeferredController.commit);

router.post("/capture", webpayPlusDeferredController.capture);

router.post("/status", webpayPlusDeferredController.status);

router.post("/refund", webpayPlusDeferredController.refund);

module.exports = router;
