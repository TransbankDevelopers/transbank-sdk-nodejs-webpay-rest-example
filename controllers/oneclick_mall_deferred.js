const asyncHandler = require("../utils/async_handler");
const Oneclick = require("transbank-sdk").Oneclick;
const TransactionDetail = require("transbank-sdk").TransactionDetail;

exports.start = asyncHandler(async (request, response, next) => {
  let randomNumber = Math.floor(Math.random() * 100000) + 1;
  let userName = "U-" + randomNumber;
  let email = "user." + randomNumber + "@example.cl";
  let responseUrl =
    request.protocol +
    "://" +
    request.get("host") +
    "/oneclick_mall_deferred/finish";

  const startResponse = await Oneclick.MallDeferredInscription.start(
    userName,
    email,
    responseUrl
  );

  let viewData = {
    userName,
    email,
    responseUrl,
    startResponse,
  };

  response.render("oneclick_mall_deferred/start", {
    step: "Comenzar inscripción",
    stepDescription:
      "En este paso comenzaremos la inscripción para poder en el siguiente paso " +
      "redirigir al Tarjetahabiente hacia el formulario de inscripción de Oneclick",
    viewData,
  });
});

exports.finish = asyncHandler(async (request, response, next) => {
  let token = request.body.TBK_TOKEN;

  const finishResponse = await Oneclick.MallDeferredInscription.finish(token);

  let viewData = {
    token,
    finishResponse,
  };

  response.render("oneclick_mall_deferred/finish", {
    step: "Finalizar inscripción",
    stepDescription:
      "En este paso terminaremos la inscripción, para luego poder hacer cargos " +
      "cargos a la tarjeta que el tarjetahabiente inscriba.",
    viewData,
  });
});

exports.authorize = asyncHandler(async (request, response, next) => {
  const username = request.body.username;
  const tbkUser = request.body.tbk_user;
  const buyOrder = "O-" + Math.floor(Math.random() * 10000) + 1;
  const childBuyOrder = "O-" + Math.floor(Math.random() * 10000) + 1;

  let amount = Math.floor(Math.random() * 1000) + 1001;
  let childCommerceCode = "597055555548";

  const details = [
    new TransactionDetail(amount, childCommerceCode, childBuyOrder),
  ];

  const authorizeResponse = await Oneclick.MallDeferredTransaction.authorize(
    username,
    tbkUser,
    buyOrder,
    details
  );

  let viewData = {
    username,
    tbkUser,
    buyOrder,
    childCommerceCode,
    amount,
    childBuyOrder,
    details,
    authorizeResponse,
  };

  response.render("oneclick_mall_deferred/authorize", {
    step: "Autorizar transacción",
    stepDescription:
      "En este paso autorizaremos una transacción en la tarjeta inscrita.",
    viewData,
  });
});

exports.capture = asyncHandler(async (request, response, next) => {
  let buyOrder = request.body.buy_order;
  let childBuyOrder = request.body.child_buy_order;
  let commerceCode = request.body.commerce_code;
  let authorizationCode = request.body.authorization_code;
  let captureAmount = request.body.capture_amount;

  const captureResponse = await Oneclick.MallDeferredTransaction.capture(
    commerceCode,
    childBuyOrder,
    captureAmount,
    authorizationCode
  );

  let viewData = {
    captureResponse,
    buyOrder,
    childBuyOrder,
    authorizationCode,
    commerceCode,
    captureAmount,
  };

  response.render("oneclick_mall_deferred/capture", {
    step: "Capturar Transacción Mall diferida",
    stepDescription:
      "En este paso debemos capturar la transacción para realmente capturar el " +
      "dinero que habia sido previamente reservado al hacer la transacción",
    viewData,
  });
});

exports.status = asyncHandler(async (request, response, next) => {
  const buyOrder = request.body.buy_order;

  const statusResponse = await Oneclick.MallDeferredTransaction.status(
    buyOrder
  );

  let viewData = {
    buyOrder,
    statusResponse,
  };

  response.render("oneclick_mall_deferred/status", {
    step: "Estado de transacción",
    stepDescription:
      "Con esta operación podemos solicitar el estado de una transacción",
    viewData,
  });
});

exports.refund = asyncHandler(async (request, response, next) => {
  const buyOrder = request.body.buy_order;
  const childCommerceCode = request.body.commerce_code;
  const childBuyOrder = request.body.child_buy_order;
  const amount = request.body.amount;

  const refundResponse = await Oneclick.MallDeferredTransaction.refund(
    buyOrder,
    childCommerceCode,
    childBuyOrder,
    amount
  );

  let viewData = {
    refundResponse,
    buyOrder,
    amount,
  };

  response.render("oneclick_mall_deferred/refund", {
    step: "Reembolso de transacción",
    stepDescription:
      "Podrás pedir el reembolso del dinero al tarjeta habiente, dependiendo del monto " +
      "y el tiempo transacurrido será una Reversa, Anulación o Anulación parcial.",
    viewData,
  });
});
