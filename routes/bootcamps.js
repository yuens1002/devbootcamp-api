const router = require('express').Router();
const { authorization: auth } = require('../middleware/auth/auth');
const { L2 } = require('../middleware/auth/authLevels');
const {
  createBootcamp,
  getAllBootcamps,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampWithinRadius,
  uploadBootcampPhoto,
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');
const qRes = require('../middleware/qRes');
const { permissions: perm } = require('../middleware/permissions');
const {
  routes: { CREATE_BOOTCAMP, BOOTCAMP_OWNERSHIP },
} = require('../consts/enums');

// include other routes
const courseRoutes = require('./courses');
const reviewRoutes = require('./reviews');
// re-route into other resource routes
router.use('/:bootcampId/courses', courseRoutes);
router.use('/:bootcampId/reviews', reviewRoutes);

router.route('/radius/:zip/:distance').get(getBootcampWithinRadius);

router
  .route('/')
  .get(qRes(Bootcamp, 'courses'), getAllBootcamps)
  .post(auth, L2, perm(CREATE_BOOTCAMP), createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(auth, L2, perm(BOOTCAMP_OWNERSHIP), updateBootcamp)
  .delete(auth, L2, perm(BOOTCAMP_OWNERSHIP), deleteBootcamp);

router
  .route('/:id/photo')
  .put(auth, L2, perm(BOOTCAMP_OWNERSHIP), uploadBootcampPhoto);

module.exports = router;
