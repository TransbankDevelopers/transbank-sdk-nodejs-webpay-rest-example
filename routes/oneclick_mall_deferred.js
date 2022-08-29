var express = require("express");
var router = express.Router();
var controller = require("../controllers/oneclick_mall_deferred");
const Oneclick = require("transbank-sdk").Oneclick;


router.use(function (req, res, next) {
  if (process.env.OCM_CC && process.env.OCM_KEY) {
    Oneclick.configureForProduction(process.env.OCMD_CC, process.env.OCMD_KEY);
  } else {
    Oneclick.configureOneclickMallDeferredForTesting();
  }
  next();
});

router.get("/start", controller.start);
router.get("/finish", controller.finish);
router.post("/finish", controller.finish);
router.post("/delete", controller.delete);
router.post("/authorize", controller.authorize);
router.post("/capture", controller.capture);
router.post("/status", controller.status);
router.post("/refund", controller.refund);
router.post("/increase_amount", controller.increaseAmount);
router.post("/reverse_amount", controller.reversePreAuthorizedAmount);
router.post("/increase_date", controller.increaseAuthorizationDate);
router.post("/history", controller.deferredCaptureHistory);

module.exports = router;
