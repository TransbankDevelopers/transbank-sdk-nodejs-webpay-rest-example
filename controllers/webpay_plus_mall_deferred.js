const WebpayPlus = require("transbank-sdk").WebpayPlus;
const TransactionDetail = require("transbank-sdk").TransactionDetail;
const IntegrationCommerceCodes = require("transbank-sdk").IntegrationCommerceCodes;
const DeferredConstants = require("../constants/deferred_constants");
const asyncHandler = require("../utils/async_handler");

const getChildCommerceCode = () => {
  if (process.env.WPPMD_CC && process.env.WPPMD_KEY) {
    return process.env.WPPMD_C_CC;
  } else {
    return IntegrationCommerceCodes.WEBPAY_PLUS_MALL_DEFERRED_CHILD1;
  }
}

exports.create = asyncHandler(async function (request, response, next) {
  let buyOrder = "O-" + Math.floor(Math.random() * 10000) + 1;
  let sessionId = "S-" + Math.floor(Math.random() * 10000) + 1;
  let childCommerceCode;
  if (process.env.WPPMD_CC && process.env.WPPMD_KEY) {
    childCommerceCode = process.env.WPPMD_C_CC;
  } else {
    childCommerceCode = IntegrationCommerceCodes.WEBPAY_PLUS_MALL_DEFERRED_CHILD1;
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

  const createResponse = await (new WebpayPlus.MallTransaction()).create(
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

  //Flujos:
  //1. Flujo normal (OK): solo llega token_ws
  //2. Timeout (más de 10 minutos en el formulario de Transbank): llegan TBK_ID_SESION y TBK_ORDEN_COMPRA
  //3. Pago abortado (con botón anular compra en el formulario de Webpay): llegan TBK_TOKEN, TBK_ID_SESION, TBK_ORDEN_COMPRA
  //4. Caso atipico: llega todos token_ws, TBK_TOKEN, TBK_ID_SESION, TBK_ORDEN_COMPRA

  let params = request.method === 'GET' ? request.query : request.body;

  let token = params.token_ws;
  let tbkToken = params.TBK_TOKEN;
  let tbkOrdenCompra = params.TBK_ORDEN_COMPRA;
  let tbkIdSesion = params.TBK_ID_SESION;

  let step = null;
  let stepDescription = null;
  let viewData = {
    token,
    tbkToken,
    tbkOrdenCompra,
    tbkIdSesion
  };

  if (token && !tbkToken) {//Flujo 1
    const resp = await (new WebpayPlus.MallTransaction()).commit(token);
    const detail = resp.details[0];
    viewData = {
      token,
      resp,
      commerceCode: detail.commerce_code,
      childBuyOrder: detail.buy_order,
      authorizationCode: detail.authorization_code,
      amount: detail.amount
    };
    step = "Confirmar Transacción Mall diferida";
    stepDescription = "En este paso tenemos que confirmar la transacción con el objetivo de avisar a " +
      "Transbank que hemos recibido la transacción ha sido recibida exitosamente. En caso de que " +
      "no se confirme la transacción, ésta será reversada.";

    response.render("webpay_plus_mall_deferred/commit", {
      step,
      stepDescription,
      viewData,
    });
    return;
  }
  else if (!token && !tbkToken) {//Flujo 2
    step = "El pago fue anulado por tiempo de espera.";
    stepDescription = "En este paso luego de anulación por tiempo de espera (+10 minutos) no es necesario realizar la confirmación ";
  }
  else if (!token && tbkToken) {//Flujo 3
    step = "El pago fue anulado por el usuario.";
    stepDescription = "En este paso luego de abandonar el formulario no es necesario realizar la confirmación ";
  }
  else if (token && tbkToken) {//Flujo 4
    step = "El pago es inválido.";
    stepDescription = "En este paso luego de abandonar el formulario no es necesario realizar la confirmación ";
  }

  response.render("webpay_plus_mall_deferred/commit-error", {
    step,
    stepDescription,
    viewData,
  });

});

exports.capture = asyncHandler(async function (request, response, next) {
  let token = request.body.token;
  let buyOrder = request.body.buy_order;
  let childBuyOrder = request.body.child_buy_order;
  let commerceCode = request.body.commerce_code;
  let authorizationCode = request.body.authorization_code;
  let captureAmount = request.body.capture_amount;

  const resp = await (new WebpayPlus.MallTransaction()).capture(
    getChildCommerceCode(),
    token,
    childBuyOrder,
    authorizationCode,
    captureAmount
  );

  let viewData = {
    resp,
    token,
    buyOrder,
    childBuyOrder,
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

  const statusResponse = await (new WebpayPlus.MallTransaction()).status(token);

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
  let childBuyOrder = request.body.child_buy_order;

  const refundResponse = await (new WebpayPlus.MallTransaction()).refund(
    token,
    childBuyOrder,
    getChildCommerceCode(),
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


exports.increaseAmount = asyncHandler(async function (request, response, next) {
  let { token, amount } = request.body;
  let childBuyOrder = request.body.child_buy_order;
  let authorizationCode = request.body.authorization_code;

  const resp = await (new WebpayPlus.MallTransaction()).increaseAmount(
    token,
    getChildCommerceCode(),
    childBuyOrder,
    authorizationCode,
    amount
  );

  let viewData = {
    resp,
    token,
    childBuyOrder,
    authorizationCode,
    amount : resp.total_amount
  };

  response.render("webpay_plus_mall_deferred/increase-amount", {
    ...DeferredConstants.INCREASE_AMOUNT_STEP,
    viewData,
  });
});

exports.increaseAuthorizationDate = asyncHandler(async function (request, response, next) {
  let { token } = request.body;
  let childBuyOrder = request.body.child_buy_order;
  let authorizationCode = request.body.authorization_code;

  const resp = await (new WebpayPlus.MallTransaction()).increaseAuthorizationDate(
    token,
    getChildCommerceCode(),
    childBuyOrder,
    authorizationCode
  );

  let viewData = {
    resp,
    token,
    childBuyOrder,
    authorizationCode,
    amount : resp.total_amount
  };
  
  response.render("webpay_plus_mall_deferred/increase-date", {
    ...DeferredConstants.INCREASE_AUTHORIZATION_DATE_STEP,
    viewData,
  });
});

exports.reversePreAuthorizedAmount = asyncHandler(async function (request, response, next) {
  let { token, amount } = request.body;
  let childBuyOrder = request.body.child_buy_order;
  let authorizationCode = request.body.authorization_code;

  const resp = await (new WebpayPlus.MallTransaction()).reversePreAuthorizedAmount(
    token,
    getChildCommerceCode(),
    childBuyOrder,
    authorizationCode,
    amount
  );

  let viewData = {
    resp,
    token,
    childBuyOrder,
    authorizationCode,
    amount : resp.total_amount
  };

  response.render("webpay_plus_mall_deferred/reverse-amount", {
    ...DeferredConstants.REVERSE_PRE_AUTHORIZATION_AMOUNT_STEP,
    viewData,
  });
});


exports.deferredCaptureHistory = asyncHandler(async function (request, response, next) {
  let { token, amount } = request.body;
  let childBuyOrder = request.body.child_buy_order;
  let authorizationCode = request.body.authorization_code;

  const resp = await (new WebpayPlus.MallTransaction()).deferredCaptureHistory(
    token,
    getChildCommerceCode(),
    childBuyOrder
  );

  let viewData = {
    resp,
    token,
    childBuyOrder,
    authorizationCode,
    amount
  };

  response.render("webpay_plus_mall_deferred/history", {
    ...DeferredConstants.DEFERRED_cAPTURE_HISTORY_STEP,
    viewData,
  });
});

