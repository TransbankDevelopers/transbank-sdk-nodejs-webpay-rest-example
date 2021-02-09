const WebpayPlus = require("transbank-sdk").WebpayPlus;
const TransactionDetail = require("transbank-sdk").TransactionDetail;
const asyncHandler = require("../utils/async_handler");

exports.create = asyncHandler(async function (request, response, next) {
  let buyOrder = "O-" + Math.floor(Math.random() * 10000) + 1;
  let sessionId = "S-" + Math.floor(Math.random() * 10000) + 1;
  let childCommerceCode;
  if (process.env.WPPMD_CC && process.env.WPPMD_KEY) {
    childCommerceCode = process.env.WPPMD_C_CC;
  } else {
    childCommerceCode = "597055555582";
  }
  let details = [
    new TransactionDetail(
      Math.floor(Math.random() * 1000) + 1001,
      childCommerceCode,
      "O-" + Math.floor(Math.random() * 10000) + 1
    ),
  ];
  let returnUrl =
    request.protocol +
    "://" +
    request.get("host") +
    "/webpay_plus_mall_deferred/commit";

  const createResponse = await WebpayPlus.MallDeferredTransaction.create(
    buyOrder,
    sessionId,
    returnUrl,
    details
  );

  let token = createResponse.token;
  let url = createResponse.url;

  let viewData = {
    buyOrder,
    sessionId,
    returnUrl,
    details,
    token,
    url,
  };
  response.render("webpay_plus_mall_deferred/create", {
    step: "Crear Transacción Mall diferida",
    stepDescription:
      "En este paso crearemos la transacción con el objetivo de obtener un identificador unico y " +
      "poder en el siguiente paso redirigir al Tarjetahabiente hacia el formulario de pago",
    viewData,
  });
});

exports.commit = asyncHandler(async function (request, response, next) {
  let token = request.body.token_ws;

  const commitResponse = await WebpayPlus.MallDeferredTransaction.commit(token);

  let viewData = {
    token,
    commitResponse,
  };

  response.render("webpay_plus_mall_deferred/commit", {
    step: "Confirmar Transacción Mall diferida",
    stepDescription:
      "En este paso tenemos que confirmar la transacción con el objetivo de avisar a " +
      "Transbank que hemos recibido la transacción ha sido recibida exitosamente. En caso de que " +
      "no se confirme la transacción, ésta será reversada.",
    viewData,
  });
});

exports.capture = asyncHandler(async function (request, response, next) {
  let token = request.body.token;
  let buyOrder = request.body.buy_order;
  let commerceCode = request.body.commerce_code;
  let authorizationCode = request.body.authorization_code;
  let captureAmount = request.body.capture_amount;

  const captureResponse = await WebpayPlus.MallDeferredTransaction.capture(
    token,
    commerceCode,
    buyOrder,
    authorizationCode,
    captureAmount
  );

  let viewData = {
    captureResponse,
    token,
    buyOrder,
    authorizationCode,
    commerceCode,
    captureAmount,
  };

  response.render("webpay_plus_mall_deferred/capture", {
    step: "Capturar Transacción Mall diferida",
    stepDescription:
      "En este paso debemos capturar la transacción para realmente capturar el " +
      "dinero que habia sido previamente reservado al hacer la transacción",
    viewData,
  });
});

exports.status = asyncHandler(async function (request, response, next) {
  let token = request.body.token;

  const statusResponse = await WebpayPlus.MallDeferredTransaction.status(token);

  let viewData = {
    token,
    statusResponse,
  };

  response.render("webpay_plus_mall_deferred/status", {
    step: "Estado de Transacción Mall diferiad",
    stepDescription:
      "Puedes solicitar el estado de una transacción hasta 7 días despues de que haya sido" +
      " realizada. No hay limite de solicitudes de este tipo, sin embargo, una vez pasados los " +
      "7 días ya no podrás revisar su estado.",
    viewData,
  });
});

exports.refund = asyncHandler(async function (request, response, next) {
  let { token, amount } = request.body;
  let buyOrder = request.body.buy_order;
  let commerceCode = request.body.commerce_code;

  const refundResponse = await WebpayPlus.MallDeferredTransaction.refund(
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

  response.render("webpay_plus_mall_deferred/refund", {
    step: "Reembolso de Transacción Mall diferida",
    stepDescription:
      "Podrás pedir el reembolso del dinero al tarjeta habiente, dependiendo del monto " +
      "y el tiempo transacurrido será una Reversa, Anulación o Anulación parcial.",
    viewData,
  });
});
