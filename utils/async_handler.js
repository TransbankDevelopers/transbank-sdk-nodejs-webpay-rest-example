const asyncHandler = (fn) => (request, response, next) => {
  return Promise.resolve(fn(request, response, next)).catch((error) => {
    console.log(error);
    next();
  });
};

module.exports = asyncHandler;
