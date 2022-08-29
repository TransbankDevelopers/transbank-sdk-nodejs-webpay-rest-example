var router = require("express").Router();
var controller = require("../controllers/transaccion_completa_mall");
const TransaccionCompleta = require("transbank-sdk").TransaccionCompleta;

router.use(function (req, res, next) {
  if (process.env.TXCM_CC && process.env.TXCM_KEY) {
    TransaccionCompleta.configureForProduction(
      process.env.TXCM_CC,
      process.env.TXCM_KEY
    );
  } else {
    TransaccionCompleta.configureForTestingMall();
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
