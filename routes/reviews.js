const router = require('express').Router({ mergeParams: true });
const { authorization: auth } = require('../middleware/auth/auth');
const { L4 } = require('../middleware/auth/authLevels');
const {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews');

const Review = require('../models/Review');
const qRes = require('../middleware/qRes');
const { permissions: perm } = require('../middleware/permissions');
const {
  routes: { REVIEW_OWNERSHIP },
} = require('../consts/enums');

router
  .route('/')
  .get(
    qRes(Review, {
      path: 'user',
      select: 'name email',
    }),
    getAllReviews
  )
  // schema enforces permission rules
  .post(auth, L4, createReview);

router
  .route('/:id')
  .get(getReview)
  .put(auth, L4, perm(REVIEW_OWNERSHIP), updateReview)
  .delete(auth, L4, perm(REVIEW_OWNERSHIP), deleteReview);

module.exports = router;
