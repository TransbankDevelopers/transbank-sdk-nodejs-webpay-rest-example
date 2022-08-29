var express = require("express");
var router = express.Router();
var controller = require("../controllers/patpass_comercio");
const PatpassComercio = require("transbank-sdk").PatpassComercio;

router.use(function (req, res, next) {
  if (process.env.WPP_CC && process.env.WPP_KEY) {
    PatpassComercio.configureForProduction(process.env.WPP_CC, process.env.WPP_KEY);
  } else {
    PatpassComercio.configureForTesting();
  }
  next();
});

router.get("/start", controller.start);
router.post("/commit", controller.commit);
router.post("/voucher_return", controller.voucherReturn);

module.exports = router;
