var express = require("express");
var router = express.Router();
var oneclickMallDeferredController = require("../controllers/oneclick_mall_deferred");
const Oneclick = require("transbank-sdk").Oneclick;

router.use(function (req, res, next) {
  if (process.env.OCM_CC && process.env.OCM_KEY) {
    Oneclick.configureForProduction(process.env.OCMD_CC, process.env.OCMD_KEY);
  } else {
    Oneclick.configureOneclickMallDeferredForTesting();
  }
  next();
});

router.get("/start", oneclickMallDeferredController.start);
router.post("/finish", oneclickMallDeferredController.finish);
router.post("/authorize", oneclickMallDeferredController.authorize);
router.post("/capture", oneclickMallDeferredController.capture);
router.post("/status", oneclickMallDeferredController.status);
router.post("/refund", oneclickMallDeferredController.refund);

module.exports = router;
