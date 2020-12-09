const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

/*
 * Users Info
 */

// @desc      Get Current signed in user
// @route     GET /api/v1/user
// @access    Private
exports.getCurrentUser = asyncHandler(async (req, res, next) => {
  // user is only there from the access middleware
  const { _id: id = '' } = req.user._id;
  if (!id) {
    return next({
      message: 'Please log in',
      statusCode: 403,
    });
  }

  const user = await User.findById(id);
  if (!user) return next({ message: "User doesn't exist", statusCode: 404 });

  res.status(200).json({ success: true, data: user });
});
