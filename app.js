var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var favicon = require("serve-favicon");

var indexRouter = require("./routes/index");
var webpayPlusRouter = require("./routes/webpay_plus");
var webpayPlusDeferredRouter = require("./routes/webpay_plus_deferred");
var webpayPlusMallRouter = require("./routes/webpay_plus_mall");
var webpayPlusMallDeferredRouter = require("./routes/webpay_plus_mall_deferred");
var oneclickMallRouter = require("./routes/oneclick_mall");
var oneclickMallDeferredRouter = require("./routes/oneclick_mall_deferred");
var transaccionCompletaRouter = require("./routes/transaccion_completa");
var transaccionCompletaMallRouter = require("./routes/transaccion_completa_mall");
var transaccionCompletaDeferredRouter = require("./routes/transaccion_completa_deferred");
var transaccionCompletaMallDeferredRouter = require("./routes/transaccion_completa_mall_deferred");
var patpassComercioRouter = require("./routes/patpass_comercio");


var app = express();
if (app.settings.env == "development") {
  require("dotenv").config();
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/webpay_plus", webpayPlusRouter);
app.use("/webpay_plus_deferred", webpayPlusDeferredRouter);
app.use("/webpay_plus_mall", webpayPlusMallRouter);
app.use("/webpay_plus_mall_deferred", webpayPlusMallDeferredRouter);
app.use("/oneclick_mall", oneclickMallRouter);
app.use("/oneclick_mall_deferred", oneclickMallDeferredRouter);
app.use("/transaccion_completa", transaccionCompletaRouter);
app.use("/transaccion_completa_mall", transaccionCompletaMallRouter);
app.use("/transaccion_completa_deferred", transaccionCompletaDeferredRouter);
app.use("/transaccion_completa_mall_deferred", transaccionCompletaMallDeferredRouter);
app.use("/patpass_comercio", patpassComercioRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
