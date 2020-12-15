const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

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

// @desc      Current in Session User
// @route     GET /api/v1/auth/user
// @access    Private
exports.getCurrentUser = asyncHandler(async (req, res, next) => {
  // req.user is available from authorization middleware
  const { _id: userId = '' } = req.user._id;
  if (!userId) {
    return next({
      message: 'Please log in',
      statusCode: 403,
    });
  }

  const user = await User.findById(userId);
  if (!user) return next({ message: "User doesn't exist", statusCode: 404 });

  res.status(200).json({ success: true, data: user });
});

// @desc      Forget Password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email = '' } = req.body || {};
  const user = await User.findOne({ email });
  if (!user) return next({ message: 'user not found', statusCode: 404 });
  // get reset token
  const resetToken = user.getResetPasswordToken();
  // changes are not saved until .save method call
  await user.save({ validateBeforeSave: false });

  // create reset url
  // prettier-ignore
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next({ message: 'Email can not be sent', statusCode: 500 });
  }

  res.status(200).json({
    success: true,
    data: 'Email sent',
  });
});

// @desc      Reset Password
// @route     PUT /api/v1/auth/resetpassword/:sentToken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { sentToken = '' } = req.params || {};
  const { password = '' } = req.body || {};
  const hashedToken = crypto
    .createHash('sha256')
    .update(sentToken)
    .digest('hex');
  console.log('hashedToken: ', hashedToken);
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return next({ message: 'Invalid token', statusCode: 400 });

  // set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  console.log('ps reset user after save: ', user);
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
