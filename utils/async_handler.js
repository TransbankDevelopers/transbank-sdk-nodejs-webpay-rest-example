const asyncHandler = (fn) => (request, response, next) => {
  return Promise.resolve(fn(request, response, next)).catch(next);
};

module.exports = asyncHandler;
