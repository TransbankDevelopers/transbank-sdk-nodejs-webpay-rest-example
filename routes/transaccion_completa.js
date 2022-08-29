var express = require("express");
var router = express.Router();
var controller = require("../controllers/transaccion_completa");
const TransaccionCompleta = require("transbank-sdk").TransaccionCompleta;

router.use(function (req, res, next) {
  if (process.env.TXC_CC && process.env.TXC_KEY) {
    TransaccionCompleta.configureForProduction(
      process.env.TXC_CC,
      process.env.TXC_KEY
    );
  } else {
    TransaccionCompleta.configureForTesting();
  }
  next();
});

router.get("/form", controller.form);
router.post("/create", controller.create);
router.post("/installments", controller.installments);
router.post("/commit", controller.commit);
router.post("/status", controller.status);
router.post("/refund", controller.refund);

module.exports = router;
