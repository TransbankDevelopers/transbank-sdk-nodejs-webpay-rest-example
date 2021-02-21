var express = require("express");
var router = express.Router();
var oneclickController = require("../controllers/oneclick_mall");
const Oneclick = require("transbank-sdk").Oneclick;

router.use(function (req, res, next) {
  if (process.env.OCM_CC && process.env.OCM_KEY) {
    Oneclick.configureForProduction(process.env.OCM_CC, process.env.OCM_KEY);
  } else {
    Oneclick.configureOneclickMallForTesting();
  }
  next();
});

router.get("/start", oneclickController.start);
router.post("/finish", oneclickController.finish);
router.post("/authorize", oneclickController.authorize);
router.post("/status", oneclickController.status);
router.post("/refund", oneclickController.refund);

module.exports = router;
