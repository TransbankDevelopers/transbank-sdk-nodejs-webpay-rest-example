const PatpassComercio = require("transbank-sdk").PatpassComercio;
const asyncHandler = require("../utils/async_handler");

exports.start = asyncHandler(async function (request, response, next) {
  
  let urlBase = request.protocol + "://" + request.get("host");
  //let urlBase = 'http://mvargas:3000';//para rutas locales utilizar un alias, no usar localhost ni ips locales

  let returnUrl = `${urlBase}/patpass_comercio/commit`;
  let name = "Isaac";
  let lastName = "Newton";
  let secondLastName = "Gonzales";
  let rut = "11111111-1";
  let serviceId = "Service_" + Math.floor(Math.random() * 10000) + 1;
  let finalUrl = `${urlBase}/patpass_comercio/voucher_return`;
  let maxAmount = 100;
  let phone = "123456734";
  let cellPhone = "123456723";
  let patpassName = "Membresia de cable";
  let personEmail = "developer@continuum.cl";
  let commerceEmail = "developer@continuum.cl";
  let address = "Satelite 101";
  let city = "Santiago";

  const resp = await (new PatpassComercio.Inscription()).start(
    returnUrl, 
    name, 
    lastName, 
    secondLastName, 
    rut, 
    serviceId, 
    finalUrl, 
    maxAmount, 
    phone, 
    cellPhone, 
    patpassName, 
    personEmail, 
    commerceEmail, 
    address, 
    city
  );

  let viewData = {
    returnUrl, 
    name, 
    lastName, 
    secondLastName, 
    rut, 
    serviceId, 
    finalUrl, 
    maxAmount, 
    phone, 
    cellPhone, 
    patpassName, 
    personEmail, 
    commerceEmail, 
    address, 
    city,
    token: resp.token,
    url: resp.url,
    resp
  };

  response.render("patpass_comercio/start", {
    step: "Inscribir Servicio",
    stepDescription:
      "En este paso inscribiremos una tarjeta con el objetivo de obtener un identificador unico y " +
      "poder en el siguiente paso redirigir al Tarjetahabiente hacia el formulario de inscripción",
    viewData,
  });
});

exports.commit = asyncHandler(async function (request, response, next) {
  let token = request.body.j_token;

  const resp = await (new PatpassComercio.Inscription()).status(token);

  let viewData = {
    token,
    resp,
    voucherUrl: resp.voucherUrl
  };

  response.render("patpass_comercio/commit", {
    step: "Confirmar Registro",
    stepDescription:
      "Es necesario confirmar el registro, este solo se puede hacer una sola vez o retornara error.",
    viewData,
  });
});

exports.voucherReturn = asyncHandler(async function (request, response, next) {

  let token = request.body.j_token;
  let voucherUrl = request.body.voucher_url;

  let viewData = {
    token,
    voucherUrl: 'https://pagoautomaticocontarjetasint.transbank.cl/nuevo-ic-rest/tokenVoucherLogin'
  };

  response.render("patpass_comercio/voucher-return", {
    step: "Inscripción finalizada",
    stepDescription:
      "La inscripción ya se encuentra finalizada.",
    viewData,
  });
});


