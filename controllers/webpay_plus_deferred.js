const WebpayPlus = require("transbank-sdk").WebpayPlus;

exports.create = async function (request, response, next) {
  let buyOrder = "O-" + Math.floor(Math.random() * 10000) + 1;
  let sessionId = "S-" + Math.floor(Math.random() * 10000) + 1;
  let amount = Math.floor(Math.random() * 1000) + 1001;
  let returnUrl =
    request.protocol +
    "://" +
    request.get("host") +
    "/webpay_plus_deferred/commit";

  let token;
  let url;
  let viewData;
  const createResponse = await WebpayPlus.DeferredTransaction.create(
    buyOrder,
    sessionId,
    amount,
    returnUrl
  )
    .then(() => {
      token = createResponse.token;
      url = createResponse.url;
      viewData = {
        buyOrder,
        sessionId,
        amount,
        returnUrl,
        token,
        url,
      };
    })
    .catch(next);

  response.render("webpay_plus_deferred/create", {
    step: "Crear Transacción diferida",
    stepDescription:
      "En este paso crearemos la transacción con el objetivo de obtener un identificador unico y " +
      "poder en el siguiente paso redirigir al Tarjetahabiente hacia el formulario de pago.",
    viewData,
  });
};

exports.commit = async function (request, response, next) {
  let token = request.body.token_ws;
  let viewData;

  const commitResponse = await WebpayPlus.DeferredTransaction.commit(token)
    .then(() => {
      viewData = {
        token,
        commitResponse,
      };
    })
    .catch(next);

  response.render("webpay_plus_deferred/commit", {
    step: "Confirmar Transacción diferida",
    stepDescription:
      "En este paso tenemos que confirmar la transacción con el objetivo de avisar a " +
      "Transbank que hemos recibido la transacción ha sido recibida exitosamente. En caso de que " +
      "no se confirme la transacción, ésta será reversada.",
    viewData,
  });
};

exports.capture = async function (request, response, next) {
  let token = request.body.token;
  let buyOrder = request.body.buy_order;
  let authorizationCode = request.body.authorization_code;
  let captureAmount = request.body.capture_amount;
  let viewData;

  const captureResponse = await WebpayPlus.DeferredTransaction.capture(
    token,
    buyOrder,
    authorizationCode,
    captureAmount
  )
    .then(() => {
      viewData = {
        captureResponse,
        token,
        buyOrder,
        authorizationCode,
        captureAmount,
      };
    })
    .catch(next);

  response.render("webpay_plus_deferred/capture", {
    step: "Capturar Transacción diferida",
    stepDescription:
      "En este paso debemos capturar la transacción para realmente capturar el " +
      "dinero que habia sido previamente reservado al hacer la transacción",
    viewData,
  });
};

exports.status = async function (request, response, next) {
  let token = request.body.token;
  let viewData;

  const statusResponse = await WebpayPlus.DeferredTransaction.status(token)
    .then(() => {
      viewData = {
        token,
        statusResponse,
      };
    })
    .catch(next);

  response.render("webpay_plus_deferred/status", {
    step: "Estado de Transacción diferida",
    stepDescription:
      "Puedes solicitar el estado de una transacción hasta 7 días despues de que haya sido" +
      " realizada. No hay limite de solicitudes de este tipo, sin embargo, una vez pasados los " +
      "7 días ya no podrás revisar su estado.",
    viewData,
  });
};

exports.refund = async function (request, response, next) {
  let { token, amount } = request.body;
  let viewData;

  const refundResponse = await WebpayPlus.DeferredTransaction.refund(
    token,
    amount
  )
    .then(() => {
      viewData = {
        token,
        amount,
        refundResponse,
      };
    })
    .catch(next);

  response.render("webpay_plus_deferred/refund", {
    step: "Reembolso de Transacción diferida",
    stepDescription:
      "Podrás pedir el reembolso del dinero al tarjeta habiente, dependiendo del monto " +
      "y el tiempo transacurrido será una Reversa, Anulación o Anulación parcial.",
    viewData,
  });
};
