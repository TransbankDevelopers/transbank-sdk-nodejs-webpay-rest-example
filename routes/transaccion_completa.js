var express = require("express");
var router = express.Router();
var transaccionCompleta = require("../controllers/transaccion_completa");
const TransaccionCompleta = require("transbank-sdk").TransaccionCompleta;

router.use(function (req, res, next) {
  if (process.env.TXC_CC && process.env.TXC_KEY) {
    TransaccionCompleta.configureForProduction(
      process.env.TXC_CC,
      process.env.TXC_KEY
    );
  } else {
    TransaccionCompleta.configureTransaccionCompletaForTesting();
  }
  next();
});

router.get("/form", transaccionCompleta.form);
router.post("/create", transaccionCompleta.create);
router.post("/installments", transaccionCompleta.installments);
router.post("/commit", transaccionCompleta.commit);
router.post("/status", transaccionCompleta.status);
router.post("/refund", transaccionCompleta.refund);

module.exports = router;
