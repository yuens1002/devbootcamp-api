const ErrorResponse = require('../utils/errorResponse');
const errorHandler = (err, req, res, next) => {
  console.log(err);
  let error = new ErrorResponse(err.message, err.statusCode),
    message;
  // look up https://mongoosejs.com/docs/api.html#error_Error for more

  if (err.name === 'CastError') {
    message = `[${err.value}] is in the wrong format or data type`;
    error = new ErrorResponse(message, 404);
  }
  // duplicate error
  if (err.name === 'MongoError') {
    const key = Object.keys(err.keyValue)[0];
    const value = err.keyValue[key];
    message = `The ${key}: ${value} is already in use`;
    error = new ErrorResponse(message, 400);
  }

  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || 'Server error' });
};

module.exports = errorHandler;
