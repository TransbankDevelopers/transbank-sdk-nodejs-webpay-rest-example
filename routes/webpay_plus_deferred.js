var express = require("express");
var router = express.Router();
var controller = require("../controllers/webpay_plus_deferred");
const WebpayPlus = require("transbank-sdk").WebpayPlus;

router.use(function (req, res, next) {
  WebpayPlus.configureForTestingDeferred();
  next();
});

router.get("/create", controller.create);
router.get("/commit", controller.commit);
router.post("/commit", controller.commit);
router.post("/capture", controller.capture);
router.post("/status", controller.status);
router.post("/refund", controller.refund);
router.post("/increase_amount", controller.increaseAmount);
router.post("/reverse_amount", controller.reversePreAuthorizedAmount);
router.post("/increase_date", controller.increaseAuthorizationDate);
router.post("/history", controller.deferredCaptureHistory);

module.exports = router;
