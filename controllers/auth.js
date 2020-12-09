const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

/*
 * User Authorization
 */

// @desc      Register for a new user account
// @route     POST /api/v1/auth/register
// @access    Private
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { email, name, role, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenRes({ user, statusCode: 200, res });
});

// @desc      User login
// @route     POST /api/v1/auth/login
// @access    Private
exports.userLogin = asyncHandler(async (req, res, next) => {
  const { email = '', password = '' } = req.body;

  if (!email || !password) {
    return next({
      message: 'Please provide an email and password',
      statusCode: 400,
    });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next({ message: 'Invalid credentials', statusCode: 401 });
  }

  isPasswordMatched = await user.matchPassword(password);
  if (!isPasswordMatched) {
    return next({ message: 'Invalid credentials', statusCode: 401 });
  }

  sendTokenRes({ user, statusCode: 200, res });
});

// Get token from modal, create the cookie then send w/ response
const sendTokenRes = ({ user, statusCode, res }) => {
  const expiration = new Date(
    Date.now() + process.env.COOKIE_EXPIRESIN * 24 * 60 * 60 * 1000
  );
  const token = user.getSignedJwtToken();
  const isProd = process.env.NODE_ENV === 'production';

  const option = {
    expires: expiration,
    // access from client side script only
    httpOnly: true,
    secure: isProd ? true : false,
  };
  // key, value, option
  res
    .status(statusCode)
    .cookie('token', token, option)
    .json({ success: true, token });
};
