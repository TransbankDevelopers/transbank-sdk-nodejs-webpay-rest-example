const WebpayPlus = require("transbank-sdk").WebpayPlus;
const TransactionDetail = require("transbank-sdk").TransactionDetail;

exports.create = async function (request, response, next) {
  let buyOrder = "O-" + Math.floor(Math.random() * 10000) + 1;
  let sessionId = "S-" + Math.floor(Math.random() * 10000) + 1;
  let details = [
    new TransactionDetail(
      Math.floor(Math.random() * 1000) + 1001,
      "597055555536",
      "O-" + Math.floor(Math.random() * 10000) + 1
    ),
    new TransactionDetail(
      Math.floor(Math.random() * 1000) + 1001,
      "597055555537",
      "O-" + Math.floor(Math.random() * 10000) + 1
    ),
  ];
  let returnUrl =
    request.protocol + "://" + request.get("host") + "/webpay_plus_mall/commit";

  let token;
  let url;
  let viewData;
  const createResponse = await WebpayPlus.MallTransaction.create(
    buyOrder,
    sessionId,
    returnUrl,
    details
  )
    .then(() => {
      token = createResponse.token;
      url = createResponse.url;

      viewData = {
        buyOrder,
        sessionId,
        returnUrl,
        details,
        token,
        url,
      };
    })
    .catch(next);

  response.render("webpay_plus_mall/create", {
    step: "Crear Transacción Mall",
    stepDescription:
      "En este paso crearemos la transacción con el objetivo de obtener un identificador unico y " +
      "poder en el siguiente paso redirigir al Tarjetahabiente hacia el formulario de pago",
    viewData,
  });
};

exports.commit = async function (request, response, next) {
  let token = request.body.token_ws;
  let viewData;

  const commitResponse = await WebpayPlus.MallTransaction.commit(token)
    .then(() => {
      viewData = {
        token,
        commitResponse,
      };
    })
    .catch(next);

  response.render("webpay_plus_mall/commit", {
    step: "Confirmar Transacción Mall",
    stepDescription:
      "En este paso tenemos que confirmar la transacción con el objetivo de avisar a " +
      "Transbank que hemos recibido la transacción ha sido recibida exitosamente. En caso de que " +
      "no se confirme la transacción, ésta será reversada.",
    viewData,
  });
};

exports.status = async function (request, response, next) {
  let token = request.body.token;
  let viewData;

  const statusResponse = await WebpayPlus.MallTransaction.status(token)
    .then(() => {
      viewData = {
        token,
        statusResponse,
      };
    })
    .catch(next);

  response.render("webpay_plus_mall/status", {
    step: "Estado de Transacción Mall",
    stepDescription:
      "Puedes solicitar el estado de una transacción hasta 7 días despues de que haya sido" +
      " realizada. No hay limite de solicitudes de este tipo, sin embargo, una vez pasados los " +
      "7 días ya no podrás revisar su estado.",
    viewData,
  });
};

exports.refund = async function (request, response, next) {
  let { token, amount } = request.body;
  let buyOrder = request.body.buy_order;
  let commerceCode = request.body.commerce_code;
  let viewData;
  const refundResponse = await WebpayPlus.MallTransaction.refund(
    token,
    buyOrder,
    commerceCode,
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

  response.render("webpay_plus_mall/refund", {
    step: "Reembolso de Transacción Mall",
    stepDescription:
      "Podrás pedir el reembolso del dinero al tarjeta habiente, dependiendo del monto " +
      "y el tiempo transacurrido será una Reversa, Anulación o Anulación parcial.",
    viewData,
  });
};
