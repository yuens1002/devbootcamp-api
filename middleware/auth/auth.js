const jwt = require('jsonwebtoken');
const asyncHandler = require('../../utils/asyncHandler');
const User = require('../../models/User');

// Protect routes
exports.access = asyncHandler(async (req, res, next) => {
  const { authorization: auth = '' } = req.headers;

  if (!auth || !auth.startsWith('Bearer')) {
    return next({ message: 'Authorization is required', statusCode: 400 });
  }

  // eg. token format: Bearer XXXXXXX
  const token = auth.split(' ')[1];

  // ensure token exists
  if (!token) {
    return next({ message: 'Access not authorized', statusCode: 401 });
  }

  try {
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    const user = await User.findById(decoded.id);

    !user && next({ message: 'User does not exist', statusCode: 400 });
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
    if (!roles.includes(req.user.role)) {
      return next({
        message: `Access level ${req.user.role} is not authorized`,
        statusCode: 403,
      });
    }
    next();
  };
};
