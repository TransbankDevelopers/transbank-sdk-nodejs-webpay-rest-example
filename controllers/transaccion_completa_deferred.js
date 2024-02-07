const TransaccionCompleta = require("transbank-sdk").TransaccionCompleta;
const { IntegrationCommerceCodes, Options, IntegrationApiKeys, Environment } = require("transbank-sdk");
const asyncHandler = require("../utils/async_handler");

exports.form = asyncHandler(async function (request, response, next) {
  response.render("transaccion_completa_deferred/form", {
    step: "Formulario",
    stepDescription:
      "Para poder comenzar con la transacción primero necesitas obtener los datos " +
      "de la tarjeta de crédito del tarjetahabiente.",
  });
});

const getTx = () => {
  const options = new Options(IntegrationCommerceCodes.TRANSACCION_COMPLETA_DEFERRED, IntegrationApiKeys.WEBPAY, Environment.Integration);
  return new TransaccionCompleta.Transaction(options);
}

exports.create = asyncHandler(async function (request, response, next) {
  let buyOrder = "O-" + Math.floor(Math.random() * 10000) + 1;
  let sessionId = "S-" + Math.floor(Math.random() * 10000) + 1;
  let amount = Math.floor(Math.random() * 1000) + 1001;
  let cvv = request.body.cvc;
  let cardNumber = request.body.number;
  let month = request.body.expiry_month;
  let year = request.body.expiry_year;
  
  const createResponse = await (getTx()).create(
    buyOrder,
    sessionId,
    amount,
    cvv,
    cardNumber,
    year + "/" + month
  );

  let viewData = {
    buyOrder,
    sessionId,
    amount,
    createResponse,
  };
  response.render("transaccion_completa_deferred/create", {
    step: "Crear Transacción",
    stepDescription:
      "En este paso crearemos la transacción con el objetivo de obtener un identificador unico.",
    viewData,
  });
});

exports.installments = asyncHandler(async function (request, response, next) {
  let token = request.body.token;
  let installments = request.body.installments;
  const installmentsResponse = await (getTx()).installments(
    token,
    installments
  );

  let viewData = {
    token,
    installmentsResponse,
  };

  response.render("transaccion_completa_deferred/installments", {
    step: "Consulta de cuotas",
    stepDescription:
      "En este paso haremos una consulta de cuotas para poder saber sus condiciones. " +
      "Este paso es opcional, se utiliza solo en el caso de que quieras utilizar cuotas",
    viewData,
  });
});

exports.commit = asyncHandler(async function (request, response, next) {
  let token = request.body.token;
  let idQueryInstallments = request.body.id_query_installments;
  let deferredPeriodIndex = request.body.deferred_period_index;
  let gracePeriod = request.body.gracePeriod;

  const resp = await (getTx()).commit(
    token,
    idQueryInstallments,
    deferredPeriodIndex,
    gracePeriod
  );

  let viewData = {
    token,
    resp,
    buyOrder: resp.buy_order,
    authorizationCode: resp.authorization_code,
    amount: resp.amount
  };

  response.render("transaccion_completa_deferred/commit", {
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

  const statusResponse = await (getTx()).status(token);

  let viewData = {
    token,
    statusResponse,
  };

  response.render("transaccion_completa_deferred/status", {
    step: "Estado de Transacción",
    stepDescription:
      "Puedes solicitar el estado de una transacción hasta 7 días despues de que haya sido" +
      " realizada. No hay limite de solicitudes de este tipo, sin embargo, una vez pasados los " +
      "7 días ya no podrás revisar su estado.",
    viewData,
  });
});

exports.capture = asyncHandler(async function (request, response, next) {
  let token = request.body.token;
  let buyOrder = request.body.buy_order;
  let authorizationCode = request.body.authorization_code;
  let amount = request.body.capture_amount;

  const resp = await (getTx()).capture(
    token,
    buyOrder,
    authorizationCode,
    amount
  );

  let viewData = {
    resp,
    token,
    buyOrder,
    authorizationCode,
    amount,
  };

  response.render("transaccion_completa_deferred/capture", {
    step: "Capturar Transacción diferida",
    stepDescription:
      "En este paso debemos capturar la transacción para realmente capturar el " +
      "dinero que habia sido previamente reservado al hacer la transacción",
    viewData,
  });
});

exports.refund = asyncHandler(async function (request, response, next) {
  let { token, amount } = request.body;

  const refundResponse = await (getTx()).refund(
    token,
    amount
  );

  let viewData = {
    token,
    amount,
    refundResponse,
  };

  response.render("transaccion_completa_deferred/refund", {
    step: "Reembolso de Transacción",
    stepDescription:
      "Podrás pedir el reembolso del dinero al tarjeta habiente, dependiendo del monto " +
      "y el tiempo transacurrido será una Reversa, Anulación o Anulación parcial.",
    viewData,
  });
});
