const WebpayPlus = require("transbank-sdk").WebpayPlus;

exports.create = async function (request, response, next) {
  let buyOrder = "O-" + Math.floor(Math.random() * 10000) + 1;
  let sessionId = "S-" + Math.floor(Math.random() * 10000) + 1;
  let amount = Math.floor(Math.random() * 1000) + 1001;
  let returnUrl =
    request.protocol + "://" + request.get("host") + "/webpay_plus/commit";

  const createResponse = await WebpayPlus.Transaction.create(
    buyOrder,
    sessionId,
    amount,
    returnUrl
  ).catch(next);

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
};

exports.commit = async function (request, response, next) {
  let token = request.body.token_ws;

  const commitResponse = await WebpayPlus.Transaction.commit(token).catch(next);

  let viewData = {
    token,
    commitResponse,
  };

  response.render("webpay_plus/commit", {
    step: "Confirmar Transacción",
    stepDescription:
      "En este paso tenemos que confirmar la transacción con el objetivo de avisar a " +
      "Transbank que hemos recibido la transacción ha sido recibida exitosamente. En caso de que " +
      "no se confirme la transacción, ésta será reversada.",
    viewData,
  });
};

exports.status = async function (request, response, next) {
  let token = request.body.token;

  const statusResponse = await WebpayPlus.Transaction.status(token).catch(next);

  let viewData = {
    statusResponse,
  };

  response.render("webpay_plus/status", {
    step: "Estado de Transacción",
    stepDescription:
      "Podemos solicitar el estado de una transacción hasta 7 días despues de que haya sido" +
      " realizada. No tiene limite de solicitudes, sin embargo, una vez pasados los 7 días ya no" +
      " podrás revisar su estado.",
    viewData,
  });
};
