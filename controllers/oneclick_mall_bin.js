const axios = require('axios');
const asyncHandler = require("../utils/async_handler");
const Oneclick = require("transbank-sdk").Oneclick;
const TransactionDetail = require("transbank-sdk").TransactionDetail;
const IntegrationApiKeys = require("transbank-sdk").IntegrationApiKeys;
const Environment = require("transbank-sdk").Environment;
const Options = require("transbank-sdk").Options;
const ApiConstants = require("transbank-sdk").ApiConstants;

const ONECLICK_MALL = '597060000001';
const OPTION = new Options(ONECLICK_MALL, IntegrationApiKeys.WEBPAY, Environment.Integration);
const ONECLICK_MALL_CHILD1 = '597060000002';
const ONECLICK_MALL_CHILD2 = '597060000003';

exports.start = asyncHandler(async (request, response, next) => {
  let randomNumber = Math.floor(Math.random() * 100000) + 1;
  let userName = "User-" + randomNumber;
  let email = "user." + randomNumber + "@example.cl";
  let responseUrl =
    request.protocol + "://" + request.get("host") + "/oneclick_mall_bin/finish";

  const startResponse = await (new Oneclick.MallInscription(OPTION)).start(
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

  response.render("oneclick_mall_bin/start", {
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
    const finishResponse = await (new Oneclick.MallInscription(OPTION)).finish(token);
    let viewData = {
      token,
      finishResponse,
    };

    response.render("oneclick_mall_bin/finish", {
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

    response.render("oneclick_mall_bin/finish-error", {
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

  const details = [
    new TransactionDetail(amount, ONECLICK_MALL_CHILD1, childBuyOrder),
  ];

  const authorizeResponse = await (new Oneclick.MallTransaction(OPTION)).authorize(
    username,
    tbkUser,
    buyOrder,
    details
  );

  let viewData = {
    username,
    tbkUser,
    buyOrder,
    ONECLICK_MALL_CHILD1,
    amount,
    childBuyOrder,
    details,
    authorizeResponse,
  };

  response.render("oneclick_mall_bin/authorize", {
    step: "Autorizar transacción",
    stepDescription:
      "En este paso autorizaremos una transacción en la tarjeta inscrita.",
    viewData,
  });
});

exports.delete = asyncHandler(async (request, response, next) => {
  const username = request.body.username;
  const tbkUser = request.body.tbk_user;
  await (new Oneclick.MallInscription(OPTION)).delete(tbkUser, username);
  
  let viewData = {
    username,
    tbkUser
  };

  response.render("oneclick_mall_bin/delete", {
    step: "Eliminar inscripción",
    stepDescription:
      "En este paso eliminaremos la inscripción.",
    viewData,
  });
});

exports.status = asyncHandler(async (request, response, next) => {
  const buyOrder = request.body.buy_order;

  const statusResponse = await (new Oneclick.MallTransaction(OPTION)).status(buyOrder);

  let viewData = {
    buyOrder,
    statusResponse,
  };

  response.render("oneclick_mall_bin/status", {
    step: "Estado de transacción",
    stepDescription:
      "Con esta operación podemos solicitar el estado de una transacción",
    viewData,
  });
});

exports.refund = asyncHandler(async (request, response, next) => {
  const buyOrder = request.body.buy_order;
  const childBuyOrder = request.body.child_buy_order;
  const amount = request.body.amount;

  const refundResponse = await (new Oneclick.MallTransaction(OPTION)).refund(
    buyOrder,
    ONECLICK_MALL_CHILD1,
    childBuyOrder,
    amount
  );

  let viewData = {
    refundResponse,
    buyOrder,
    amount,
  };

  response.render("oneclick_mall_bin/refund", {
    step: "Reembolso de transacción",
    stepDescription:
      "Podrás pedir el reembolso del dinero al tarjeta habiente, dependiendo del monto " +
      "y el tiempo transacurrido será una Reversa, Anulación o Anulación parcial.",
    viewData,
  });
});

exports.bin = asyncHandler(async (request, response, next) => {
  try {
    const tbkUser = request.body.tbk_user;

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `https://webpay3gint.transbank.cl/rswebpaytransaction/api/oneclick/v1.2/bin_info`,
      headers: { 
        'Tbk-Api-Key-Id': ONECLICK_MALL, 
        'Tbk-Api-Key-Secret': IntegrationApiKeys.WEBPAY, 
        'Content-Type': 'application/json'
      },
      data : JSON.stringify({ 'tbk_user': tbkUser })
    };

    const resp = await axios.request(config);
    let viewData = {
      tbkUser,
      binResponse: resp.data
    };
  
    response.render("oneclick_mall_bin/bin", {
      step: "Bin de la Tarjeta inscrita",
      stepDescription:
        "En este paso te mostraremos la información del bin de la tarjeta.",
      viewData,
    });

  } catch (error) {
      console.error(error);
  }
});

