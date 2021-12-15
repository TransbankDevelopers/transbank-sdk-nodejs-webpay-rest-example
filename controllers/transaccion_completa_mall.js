const TransaccionCompleta = require("transbank-sdk").TransaccionCompleta;
const TransactionDetail = require("transbank-sdk").TransactionDetail;
const InstallmentDetail = require("transbank-sdk").InstallmentDetail;
const CommitDetail = require("transbank-sdk").CommitDetail;
const IntegrationCommerceCodes = require("transbank-sdk").IntegrationCommerceCodes;
const asyncHandler = require("../utils/async_handler");

exports.form = asyncHandler(async function (request, response, next) {
  response.render("transaccion_completa_mall/form", {
    step: "Formulario",
    stepDescription:
      "Para poder comenzar con la transacción primero necesitas obtener los datos " +
      "de la tarjeta de crédito del tarjetahabiente.",
  });
});

exports.create = asyncHandler(async function (request, response, next) {
  let buyOrder = "O-" + Math.floor(Math.random() * 10000) + 1;
  let childBuyOrder = "O-" + Math.floor(Math.random() * 10000) + 1;
  let sessionId = "S-" + Math.floor(Math.random() * 10000) + 1;
  let amount = Math.floor(Math.random() * 1000) + 1001;
  let cvv = request.body.cvc;
  let cardNumber = request.body.number;
  let month = request.body.expiry_month;
  let year = request.body.expiry_year;
  let commerceCode = IntegrationCommerceCodes.TRANSACCION_COMPLETA_MALL_CHILD1;

  let details = [new TransactionDetail(amount, commerceCode, childBuyOrder)];
  const createResponse = await (new TransaccionCompleta.MallTransaction()).create(
    buyOrder,
    sessionId,
    cardNumber,
    year + "/" + month,
    details,
    cvv
  );

  let viewData = {
    commerceCode,
    childBuyOrder,
    createResponse,
  };
  response.render("transaccion_completa_mall/create", {
    step: "Crear Transacción",
    stepDescription:
      "En este paso crearemos la transacción con el objetivo de obtener un identificador unico.",
    viewData,
  });
});

exports.installments = asyncHandler(async function (request, response, next) {
  let token = request.body.token;
  let installments = request.body.installments;
  let childCommerceCode = request.body.child_commerce_code;
  let childBuyOrder = request.body.child_buy_order;

  let installmentDetails = [
    new InstallmentDetail(childCommerceCode, childBuyOrder, installments),
  ];

  const installmentsResponse = await (new TransaccionCompleta.MallTransaction()).installments(
    token,
    installmentDetails
  );

  let viewData = {
    token,
    childCommerceCode,
    childBuyOrder,
    installmentsResponse,
  };

  response.render("transaccion_completa_mall/installments", {
    step: "Consulta de cuotas",
    stepDescription:
      "En este paso haremos una consulta de cuotas para poder saber sus condiciones. " +
      "Este paso es opcional, se utiliza solo en el caso de que quieras utilizar cuotas",
    viewData,
  });
});

exports.commit = asyncHandler(async function (request, response, next) {
  let token = request.body.token;
  let childCommerceCode = request.body.child_commerce_code;
  let childBuyOrder = request.body.child_buy_order;
  let idQueryInstallments = request.body.id_query_installments;
  let deferredPeriodIndex = request.body.deferred_period_index;
  let gracePeriod = request.body.gracePeriod;

  let details = [
    new CommitDetail(
      childCommerceCode,
      childBuyOrder,
      idQueryInstallments,
      deferredPeriodIndex,
      gracePeriod
    ),
  ];

  const commitResponse = await (new TransaccionCompleta.MallTransaction()).commit(
    token,
    details
  );

  let viewData = {
    token,
    commitResponse,
  };

  response.render("transaccion_completa_mall/commit", {
    step: "Confirmar Transacción",
    stepDescription:
      "En este paso tenemos que confirmar la transacción con el objetivo de avisar a " +
      "Transbank que hemos recibido la transacción ha sido recibida exitosamente. En caso de que " +
      "no se confirme la transacción, ésta será reversada.",
    viewData,
  });
});

exports.status = asyncHandler(async function (request, response, next) {
  let token = request.body.token;

  const statusResponse = await (new TransaccionCompleta.MallTransaction()).status(
    token
  );

  let viewData = {
    token,
    statusResponse,
  };

  response.render("transaccion_completa_mall/status", {
    step: "Estado de Transacción",
    stepDescription:
      "Puedes solicitar el estado de una transacción hasta 7 días despues de que haya sido" +
      " realizada. No hay limite de solicitudes de este tipo, sin embargo, una vez pasados los " +
      "7 días ya no podrás revisar su estado.",
    viewData,
  });
});

exports.refund = asyncHandler(async function (request, response, next) {
  let { token, amount } = request.body;
  let buyOrder = request.body.child_buy_order;
  let commerceCode = request.body.child_commerce_code;

  const refundResponse = await (new TransaccionCompleta.MallTransaction()).refund(
    token,
    buyOrder,
    commerceCode,
    amount
  );

  let viewData = {
    token,
    amount,
    refundResponse,
  };

  response.render("transaccion_completa_mall/refund", {
    step: "Reembolso de Transacción",
    stepDescription:
      "Podrás pedir el reembolso del dinero al tarjeta habiente, dependiendo del monto " +
      "y el tiempo transacurrido será una Reversa, Anulación o Anulación parcial.",
    viewData,
  });
});
