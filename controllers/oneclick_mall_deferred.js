const Oneclick = require("transbank-sdk").Oneclick;
const TransactionDetail = require("transbank-sdk").TransactionDetail;
const { Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = require("transbank-sdk");
const asyncHandler = require("../utils/async_handler");
const DeferredConstants = require("../constants/deferred_constants");

const getChildCommerceCode = () => {
  if (process.env.OCM_CC && process.env.OCM_KEY) {
    return process.env.OCMD_CC;
  } else {
    return IntegrationCommerceCodes.ONECLICK_MALL_CHILD1_DEFERRED;
  }
}

exports.start = asyncHandler(async (request, response, next) => {
  let randomNumber = Math.floor(Math.random() * 100000) + 1;
  let userName = "User-" + randomNumber;
  let email = "user." + randomNumber + "@example.cl";
  let responseUrl =
    request.protocol +
    "://" +
    request.get("host") +
    "/oneclick_mall_deferred/finish";
  const options = new Options(IntegrationCommerceCodes.ONECLICK_MALL_DEFERRED, IntegrationApiKeys.WEBPAY, Environment.Integration);
  const startResponse = await (new Oneclick.MallInscription(options)).start(
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
  let params = request.method === 'GET' ? request.query : request.body;

  let token = params.TBK_TOKEN;
  let tbkOrdenCompra = params.TBK_ORDEN_COMPRA;
  let tbkIdSesion = params.TBK_ID_SESION;
  let amount = Math.floor(Math.random() * 1000) + 1001;
  let installments = 0;
  if (tbkOrdenCompra == null){
    const options = new Options(IntegrationCommerceCodes.ONECLICK_MALL_DEFERRED, IntegrationApiKeys.WEBPAY, Environment.Integration);
    const finishResponse = await (new Oneclick.MallInscription(options)).finish(token);
    let viewData = {
      token,
      finishResponse,
      amount,
      installments
    };

    response.render("oneclick_mall_deferred/finish", {
      step: "Finalizar inscripción",
      stepDescription:
        "En este paso terminaremos la inscripción, para luego poder hacer cargos " +
        "cargos a la tarjeta que el tarjetahabiente inscriba.",
      viewData,
    });
  }
  else{
    let viewData = {
      token,
      tbkOrdenCompra,
      tbkIdSesion
    };

    response.render("oneclick_mall_deferred/finish-error", {
      step: "La inscripción fue anulada por el usuario",
      stepDescription:
        "En este paso abandonamos la inscripción al haber presionado la opción 'Abandonar y volver al comercio'",
      viewData,
    });
  }

});

exports.delete = asyncHandler(async (request, response, next) => {
  const username = request.body.username;
  const tbkUser = request.body.tbk_user;
  const options = new Options(IntegrationCommerceCodes.ONECLICK_MALL_DEFERRED, IntegrationApiKeys.WEBPAY, Environment.Integration);
  await (new Oneclick.MallInscription(options)).delete(tbkUser, username);
  
  let viewData = {
    username,
    tbkUser
  };

  response.render("oneclick_mall_deferred/delete", {
    step: "Eliminar inscripción",
    stepDescription:
      "En este paso eliminaremos la inscripción.",
    viewData,
  });
});


exports.authorize = asyncHandler(async (request, response, next) => {
  const username = request.body.username;
  const tbkUser = request.body.tbk_user;
  const buyOrder = "O-" + Math.floor(Math.random() * 10000) + 1;
  const childBuyOrder = "O-" + Math.floor(Math.random() * 10000) + 1;
  const amount = request.body.amount;
  const installmentsNumber = request.body.installments;

  let childCommerceCode = getChildCommerceCode();

  const details = [
    new TransactionDetail(amount, childCommerceCode, childBuyOrder, installmentsNumber),
  ];
  const options = new Options(IntegrationCommerceCodes.ONECLICK_MALL_DEFERRED, IntegrationApiKeys.WEBPAY, Environment.Integration);
  const resp = await (new Oneclick.MallTransaction(options)).authorize(
    username,
    tbkUser,
    buyOrder,
    details
  );
  const detail = resp.details[0];

  let viewData = {
    username,
    tbkUser,
    details,
    resp,
    commerceCode: detail.commerce_code,
    buyOrder,
    childBuyOrder,
    authorizationCode: detail.authorization_code,
    amount: detail.amount
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
  let commerceCode = getChildCommerceCode();
  let authorizationCode = request.body.authorization_code;
  let captureAmount = request.body.capture_amount;

  console.log("================================================================================");
  console.log(request);
  console.log("================================================================================");
  const options = new Options(IntegrationCommerceCodes.ONECLICK_MALL_DEFERRED, IntegrationApiKeys.WEBPAY, Environment.Integration);
  const captureResponse = await (new Oneclick.MallTransaction(options)).capture(
    commerceCode,
    childBuyOrder,
    authorizationCode,
    captureAmount
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
  const options = new Options(IntegrationCommerceCodes.ONECLICK_MALL_DEFERRED, IntegrationApiKeys.WEBPAY, Environment.Integration);
  const statusResponse = await (new Oneclick.MallTransaction(options)).status(
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
  const options = new Options(IntegrationCommerceCodes.ONECLICK_MALL_DEFERRED, IntegrationApiKeys.WEBPAY, Environment.Integration);
  const refundResponse = await (new Oneclick.MallTransaction(options)).refund(
    buyOrder,
    getChildCommerceCode(),
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


exports.increaseAmount = asyncHandler(async function (request, response, next) {
  let amount = request.body.amount;
  let buyOrder = request.body.buy_order;
  let childBuyOrder = request.body.child_buy_order;
  let authorizationCode = request.body.authorization_code;

  const resp = await (new Oneclick.MallTransaction()).increaseAmount(
    getChildCommerceCode(),
    childBuyOrder,
    authorizationCode,
    amount
  );

  let viewData = {
    resp,
    buyOrder,
    childBuyOrder,
    authorizationCode,
    amount : resp.total_amount
  };

  response.render("oneclick_mall_deferred/increase-amount", {
    ...DeferredConstants.INCREASE_AMOUNT_STEP,
    viewData,
  });
});

exports.increaseAuthorizationDate = asyncHandler(async function (request, response, next) {
  let buyOrder = request.body.buy_order;
  let childBuyOrder = request.body.child_buy_order;
  let authorizationCode = request.body.authorization_code;

  const resp = await (new Oneclick.MallTransaction()).increaseAuthorizationDate(
    getChildCommerceCode(),
    childBuyOrder,
    authorizationCode
  );

  let viewData = {
    resp,
    buyOrder,
    childBuyOrder,
    authorizationCode,
    amount : resp.total_amount
  };
  
  response.render("oneclick_mall_deferred/increase-date", {
    ...DeferredConstants.INCREASE_AUTHORIZATION_DATE_STEP,
    viewData,
  });
});

exports.reversePreAuthorizedAmount = asyncHandler(async function (request, response, next) {
  let amount = request.body.amount;
  let buyOrder = request.body.buy_order;
  let childBuyOrder = request.body.child_buy_order;
  let authorizationCode = request.body.authorization_code;

  const resp = await (new Oneclick.MallTransaction()).reversePreAuthorizedAmount(
    getChildCommerceCode(),
    childBuyOrder,
    authorizationCode,
    amount
  );

  let viewData = {
    resp,
    buyOrder,
    childBuyOrder,
    authorizationCode,
    amount : resp.total_amount
  };

  response.render("oneclick_mall_deferred/reverse-amount", {
    ...DeferredConstants.REVERSE_PRE_AUTHORIZATION_AMOUNT_STEP,
    viewData,
  });
});


exports.deferredCaptureHistory = asyncHandler(async function (request, response, next) {
  let amount = request.body.amount;
  let buyOrder = request.body.buy_order;
  let childBuyOrder = request.body.child_buy_order;
  let authorizationCode = request.body.authorization_code;

  const resp = await (new Oneclick.MallTransaction()).deferredCaptureHistory(
    getChildCommerceCode(),
    childBuyOrder,
    authorizationCode
  );

  let viewData = {
    resp,
    buyOrder,
    childBuyOrder,
    authorizationCode,
    amount
  };

  response.render("oneclick_mall_deferred/history", {
    ...DeferredConstants.DEFERRED_cAPTURE_HISTORY_STEP,
    viewData,
  });
});
