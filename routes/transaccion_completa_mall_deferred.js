var router = require("express").Router();
var controller = require("../controllers/transaccion_completa_mall_deferred");
const TransaccionCompleta = require("transbank-sdk").TransaccionCompleta;

router.use(function (req, res, next) {
  if (process.env.TXCM_CC && process.env.TXCM_KEY) {
    TransaccionCompleta.configureForProduction(
      process.env.TXCM_CC,
      process.env.TXCM_KEY
    );
  } else {
    TransaccionCompleta.configureForTestingMallDeferred();
  }
  next();
});

router.get("/form", controller.form);
router.post("/create", controller.create);
router.post("/installments", controller.installments);
router.post("/commit", controller.commit);
router.post("/status", controller.status);
router.post("/capture", controller.capture);
router.post("/refund", controller.refund);
router.post("/increase_amount", controller.increaseAmount);
router.post("/reverse_amount", controller.reversePreAuthorizedAmount);
router.post("/increase_date", controller.increaseAuthorizationDate);
router.post("/history", controller.deferredCaptureHistory);

module.exports = router;
