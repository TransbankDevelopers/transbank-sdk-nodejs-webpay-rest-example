var express = require("express");
var router = express.Router();
var webpay_plus_controller = require("../controllers/webpay_plus");

router.get("/create", webpay_plus_controller.create);

module.exports = router;
