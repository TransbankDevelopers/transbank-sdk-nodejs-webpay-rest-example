var express = require("express");
var router = express.Router();
var controller = require("../controllers/oneclick_mall");
const Oneclick = require("transbank-sdk").Oneclick;

router.use(function (req, res, next) {
  if (process.env.OCM_CC && process.env.OCM_KEY) {
    Oneclick.configureForProduction(process.env.OCM_CC, process.env.OCM_KEY);
  } else {
    Oneclick.configureOneclickMallForTesting();
  }
  next();
});

router.get("/start", controller.start);
router.get("/finish", controller.finish);
router.post("/finish", controller.finish);
router.post("/delete", controller.delete);
router.post("/authorize", controller.authorize);
router.post("/status", controller.status);
router.post("/refund", controller.refund);

module.exports = router;
