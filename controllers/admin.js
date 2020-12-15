const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

/*
 * Users Info
 */

// @desc      Get All Users
// @route     GET /api/v1/admin/users
// @access    Private/Admin
exports.getAllUsers = asyncHandler((req, res, next) => {
  // query
  res.status(200).json(res.qRes);
});

// @desc      Get a User
// @route     GET /api/v1/admin/users/:id
// @access    Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  // user is only there from the access middleware
  const user = await User.findById(req.params.id);
  if (!user) return next({ message: 'User not found', statusCode: 404 });

  res.status(200).json({ success: true, data: user });
});

// @desc      Create a User
// @route     POST /api/v1/admin/users
// @access    Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  if (!user)
    return next({
      message: 'User creation failed, please try again',
      statusCode: 500,
    });

  res.status(201).json({ success: true, data: user });
});

// @desc      Update a User
// @route     PUT /api/v1/admin/users/:id
// @access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  // user is only there from the access middleware
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user)
    return next({
      message: 'Update user failed, please try again',
      statusCode: 500,
    });

  res.status(201).json({ success: true, data: user });
});

// @desc      Delete a User
// @route     PUT /api/v1/admin/users/:id
// @access    Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  // user is only there from the access middleware
  const user = await User.findById(req.params.id);
  if (!user) return next({ message: 'User not found', statusCode: 404 });

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, data: {} });
});
