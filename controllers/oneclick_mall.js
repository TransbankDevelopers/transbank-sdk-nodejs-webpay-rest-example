const asyncHandler = require("../utils/async_handler");
const Oneclick = require("transbank-sdk").Oneclick;
const TransactionDetail = require("transbank-sdk").TransactionDetail;
const IntegrationCommerceCodes = require("transbank-sdk").IntegrationCommerceCodes;


exports.start = asyncHandler(async (request, response, next) => {
  let randomNumber = Math.floor(Math.random() * 100000) + 1;
  let userName = "User-" + randomNumber;
  let email = "user." + randomNumber + "@example.cl";
  let responseUrl =
    request.protocol + "://" + request.get("host") + "/oneclick_mall/finish";

  const startResponse = await (new Oneclick.MallInscription()).start(
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


  if (tbkOrdenCompra == null){
    const finishResponse = await (new Oneclick.MallInscription()).finish(token);
    let viewData = {
      token,
      finishResponse,
    };

    response.render("oneclick_mall/finish", {
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

    response.render("oneclick_mall/finish-error", {
      step: "La inscripción fue anulada por el usuario",
      stepDescription:
        "En este paso abandonamos la inscripción al haber presionado la opción 'Abandonar y volver al comercio'",
      viewData,
    });
  }

});



exports.authorize = asyncHandler(async (request, response, next) => {
  const username = request.body.username;
  const tbkUser = request.body.tbk_user;
  const buyOrder = "O-" + Math.floor(Math.random() * 10000) + 1;
  const childBuyOrder = "O-" + Math.floor(Math.random() * 10000) + 1;

  let amount = Math.floor(Math.random() * 1000) + 1001;
  let childCommerceCode = IntegrationCommerceCodes.ONECLICK_MALL_CHILD1;

  const details = [
    new TransactionDetail(amount, childCommerceCode, childBuyOrder),
  ];

  const authorizeResponse = await (new Oneclick.MallTransaction()).authorize(
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
    step: "Autorizar transacción",
    stepDescription:
      "En este paso autorizaremos una transacción en la tarjeta inscrita.",
    viewData,
  });
});

exports.delete = asyncHandler(async (request, response, next) => {
  const username = request.body.username;
  const tbkUser = request.body.tbk_user;
  await (new Oneclick.MallInscription()).delete(tbkUser, username);
  
  let viewData = {
    username,
    tbkUser
  };

  response.render("oneclick_mall/delete", {
    step: "Eliminar inscripción",
    stepDescription:
      "En este paso eliminaremos la inscripción.",
    viewData,
  });
});

exports.status = asyncHandler(async (request, response, next) => {
  const buyOrder = request.body.buy_order;

  const statusResponse = await (new Oneclick.MallTransaction()).status(buyOrder);

  let viewData = {
    buyOrder,
    statusResponse,
  };

  response.render("oneclick_mall/status", {
    step: "Estado de transacción",
    stepDescription:
      "Con esta operación podemos solicitar el estado de una transacción",
    viewData,
  });
});

exports.refund = asyncHandler(async (request, response, next) => {
  const buyOrder = request.body.buy_order;
  const childCommerceCode = "597055555542";
  const childBuyOrder = request.body.child_buy_order;
  const amount = request.body.amount;

  const refundResponse = await (new Oneclick.MallTransaction()).refund(
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

  response.render("oneclick_mall/refund", {
    step: "Reembolso de transacción",
    stepDescription:
      "Podrás pedir el reembolso del dinero al tarjeta habiente, dependiendo del monto " +
      "y el tiempo transacurrido será una Reversa, Anulación o Anulación parcial.",
    viewData,
  });
});
