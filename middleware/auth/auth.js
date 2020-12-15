const jwt = require('jsonwebtoken');
const asyncHandler = require('../../utils/asyncHandler');
const ErrorResponse = require('../../utils/errorResponse');
const User = require('../../models/User');

// Protect routes
exports.authorization = asyncHandler(async (req, res, next) => {
  const { authorization: auth = '' } = req.headers;

  // set token from cookies if it exists
  let token = req.cookies.token || '';

  if (!token) {
    if (!auth || !auth.startsWith('Bearer')) {
      return next({ message: 'Authorization is required', statusCode: 401 });
    }

    // eg. token format: Bearer XXXXXXX
    token = auth.split(' ')[1];

    // ensure token exists
    if (!token) {
      return next({ message: 'Access not authorized', statusCode: 401 });
    }
  }

  try {
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    const user = await User.findById(decoded.id);

    !user && next({ message: 'User does not exist', statusCode: 400 });
    console.log(user);
    req.user = user;

    // middleware needs to call next to proceed
    next();
  } catch (err) {
    next({ message: 'Access not authorized', statusCode: 401 });
  }
});

// grant access to specific roles
exports.authorize = (roles) => {
  return (req, res, next) => {
    const { role = '' } = req.user;
    if (!roles.includes(role)) {
      return next({
        message: `User role [${role.toUpperCase()}] is not authorized`,
        statusCode: 401,
      });
    }
    next();
  };
};
