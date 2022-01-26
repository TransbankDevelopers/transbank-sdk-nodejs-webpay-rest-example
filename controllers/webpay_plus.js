const WebpayPlus = require("transbank-sdk").WebpayPlus;
const asyncHandler = require("../utils/async_handler");

exports.create = asyncHandler(async function (request, response, next) {
  let buyOrder = "O-" + Math.floor(Math.random() * 10000) + 1;
  let sessionId = "S-" + Math.floor(Math.random() * 10000) + 1;
  let amount = Math.floor(Math.random() * 1000) + 1001;
  let returnUrl =
    request.protocol + "://" + request.get("host") + "/webpay_plus/commit";

  const createResponse = await (new WebpayPlus.Transaction()).create(
    buyOrder,
    sessionId,
    amount,
    returnUrl
  );

  let token = createResponse.token;
  let url = createResponse.url;

  let viewData = {
    buyOrder,
    sessionId,
    amount,
    returnUrl,
    token,
    url,
  };
  response.render("webpay_plus/create", {
    step: "Crear Transacción",
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
  console.log("================================================================================");
  console.log(request);
  console.log("================================================================================");
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
    const commitResponse = await (new WebpayPlus.Transaction()).commit(token);
    viewData = {
      token,
      commitResponse,
    };
    step = "Confirmar Transacción";
    stepDescription = "En este paso tenemos que confirmar la transacción con el objetivo de avisar a " +
      "Transbank que hemos recibido la transacción ha sido recibida exitosamente. En caso de que " +
      "no se confirme la transacción, ésta será reversada.";

    response.render("webpay_plus/commit", {
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

  response.render("webpay_plus/commit-error", {
    step,
    stepDescription,
    viewData,
  });
});



exports.status = asyncHandler(async function (request, response, next) {
  let token = request.body.token;

  const statusResponse = await (new WebpayPlus.Transaction()).status(token);

  let viewData = {
    token,
    statusResponse,
  };

  response.render("webpay_plus/status", {
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

  const refundResponse = await (new WebpayPlus.Transaction()).refund(token, amount);

  let viewData = {
    token,
    amount,
    refundResponse,
  };

  response.render("webpay_plus/refund", {
    step: "Reembolso de Transacción",
    stepDescription:
      "Podrás pedir el reembolso del dinero al tarjeta habiente, dependiendo del monto " +
      "y el tiempo transacurrido será una Reversa, Anulación o Anulación parcial.",
    viewData,
  });
});
