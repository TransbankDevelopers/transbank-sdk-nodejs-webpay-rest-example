const WebpayPlus = require("transbank-sdk").WebpayPlus;

exports.create = async function (req, res, next) {
  let buyOrder = "O-" + Math.floor(Math.random() * 10000) + 1;
  let sessionId = "S-" + Math.floor(Math.random() * 10000) + 1;
  let amount = Math.floor(Math.random() * 1000) + 1001;
  let returnUrl =
    req.protocol + "://" + req.get("host") + "/webpay_plus/commit";

  let response = await WebpayPlus.Transaction.create(
    buyOrder,
    sessionId,
    amount,
    returnUrl
  );

  let token = response.token;
  let url = response.url;

  let viewData = {
    buyOrder,
    sessionId,
    amount,
    returnUrl,
    response,
    token,
    url,
  };
  res.render("webpay_plus/create", {
    step: "Crear Transacción",
    stepDescription:
      "En este paso crearemos la transacción con el objetivo de obtener un identificador unico y " +
      "poder en el siguiente paso redirigir al Tarjetahabiente hacia el formulario de pago",
    viewData,
  });
};
