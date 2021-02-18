const asyncHandler = require("../utils/async_handler");
const Oneclick = require("transbank-sdk").Oneclick;
const TransactionDetail = require("transbank-sdk").TransactionDetail;

exports.start = asyncHandler(async (request, response, next) => {
  let randomNumber = Math.floor(Math.random() * 100000) + 1;
  let userName = "U-" + randomNumber;
  let email = "user." + randomNumber + "@example.cl";
  let responseUrl =
    request.protocol + "://" + request.get("host") + "/oneclick_mall/finish";

  const startResponse = await Oneclick.MallInscription.start(
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

  response.render("oneclick_mall/start", {
    step: "Comenzar Inscripción",
    stepDescription:
      "En este paso comenzaremos la inscripción para poder en el siguiente paso " +
      "redirigir al Tarjetahabiente hacia el formulario de inscripción de Oneclick",
    viewData,
  });
});

exports.finish = asyncHandler(async (request, response, next) => {
  let token = request.body.TBK_TOKEN;

  const finishResponse = await Oneclick.MallInscription.finish(token);

  let viewData = {
    token,
    finishResponse,
  };

  response.render("oneclick_mall/finish", {
    step: "Finalizar Inscripción",
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
  let childCommerceCode = "597055555542";

  const details = [
    new TransactionDetail(amount, childCommerceCode, childBuyOrder),
  ];

  const authorizeResponse = await Oneclick.MallTransaction.authorize(
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

  response.render("oneclick_mall/authorize", {
    step: "Autorizar Transacción",
    stepDescription:
      "En este paso autorizaremos una transacción en la tarjeta inscrita.",
    viewData,
  });
});
