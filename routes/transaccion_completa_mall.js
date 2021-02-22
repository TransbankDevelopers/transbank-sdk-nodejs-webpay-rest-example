var router = require("express").Router();
var transaccionCompletaMall = require("../controllers/transaccion_completa_mall");
const TransaccionCompleta = require("transbank-sdk").TransaccionCompleta;

router.use(function (req, res, next) {
  if (process.env.TXCM_CC && process.env.TXCM_KEY) {
    TransaccionCompleta.configureForProduction(
      process.env.TXCM_CC,
      process.env.TXCM_KEY
    );
  } else {
    TransaccionCompleta.configureTransaccionCompletaMallForTesting();
  }
  next();
});

router.get("/form", transaccionCompletaMall.form);
router.post("/create", transaccionCompletaMall.create);
router.post("/installments", transaccionCompletaMall.installments);
router.post("/commit", transaccionCompletaMall.commit);
router.post("/status", transaccionCompletaMall.status);
router.post("/refund", transaccionCompletaMall.refund);

module.exports = router;
