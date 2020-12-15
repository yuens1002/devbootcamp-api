const asyncHandler = require('../utils/asyncHandler');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

// @desc      Get all reviews and reviews of a bootcamp
// @route     GET /api/v1/reviews
// @route     GET /api/v1/bootcamps/:bootcampId/reviews
// @access    Public
exports.getAllReviews = asyncHandler(async (req, res, next) => {
  const { params: { bootcampId } = '' } = req;
  if (bootcampId) {
    const data = await Review.find({ bootcamp: bootcampId });
    // data validity is NOT checked b/c route is not authenticated nor provisioned
    return data.length
      ? res.status(200).json({ success: true, count: data.length, data })
      : next({
          // bootcamp not found b/c that's the id being passed for the query
          message: `Bootcamp not found with the id of ${bootcampId}`,
          statusCode: 404,
        });
  }
  res.status(200).json(res.qRes);
});

// @desc      Get a review
// @route     GET /api/v1/reviews/:id
// @access    Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const { id: reviewId = '' } = req.params || {};
  const review = await (await Review.findById(reviewId)).populate({
    path: 'user',
    select: 'name email',
  });
  if (!review) {
    next({
      // bootcamp not found b/c that's the id being passed for the query
      message: `Review not found with the id of ${reviewId}`,
      statusCode: 404,
    });
  }
  res.status(200).json({ success: true, data: review });
});

// @desc      Create a review
// @route     POST /api/v1/bootcamps/:bootcampId/reviews/
// @access    Private
exports.createReview = asyncHandler(async (req, res, next) => {
  const { bootcampId = '' } = req.params || {};
  const { id: userId = '' } = req.user || {};

  console.log('createReview: ', bootcampId);

  const bootcamp = await await Bootcamp.findById(bootcampId);
  console.log('createReview: ', bootcamp);
  if (!bootcamp)
    // bootcamp not found b/c that's the id being passed for the query
    return next({
      message: `Bootcamp not found with id  ${bootcampId}`,
      statusCode: 404,
    });

  req.body.bootcamp = bootcampId;
  req.body.user = userId;

  const review = await Review.create(req.body);
  if (!review) {
    next({
      message: `Review not created, please re-submit at a later time`,
      statusCode: 500,
    });
  }
  review.populate({
    path: 'user',
    select: 'name email',
  });
  res.status(201).json({ success: true, data: review });
});

// @desc      Update a review
// @route     PUT /api/v1/reviews/:id
// @access    Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  // perms have done error checking on existence and ownership
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate({
    path: 'user',
    select: 'name email',
  });
  if (!review) {
    next({
      // bootcamp not found b/c that's the id being passed for the query
      message: `Review not updated, please re-submit at a later time`,
      statusCode: 500,
    });
  }
  // calc bootcamp avg rating if rating is updated
  req.body.rating && Review.getAverageRating(review.bootcamp);
  res.status(201).json({ success: true, data: review });
});

// @desc      Delete a review
// @route     DELETE /api/v1/reviews/:id
// @access    Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  // perms have done error checking on existence and ownership
  const review = Review.findById(req.params.id);
  if (!review) {
    next({
      message: `Review not found`,
      statusCode: 404,
    });
  }
  await review.remove();
  res.status(201).json({ success: true, data: {} });
});
