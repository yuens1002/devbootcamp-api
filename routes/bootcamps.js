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
  routes: { CREATE_BOOTCAMP, OWNERSHIP_REQUIRED },
} = require('../consts/enums');

// include course routes
const courseRoutes = require('./courses');
// re-route into other resource routes
router.use('/:bootcampId/courses', courseRoutes);

router.route('/radius/:zip/:distance').get(getBootcampWithinRadius);

router
  .route('/')
  .get(qRes(Bootcamp, 'courses'), getAllBootcamps)
  .post(auth, L2, perm(CREATE_BOOTCAMP), createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(auth, L2, perm(OWNERSHIP_REQUIRED), updateBootcamp)
  .delete(auth, L2, perm(OWNERSHIP_REQUIRED), deleteBootcamp);

router
  .route('/:id/photo')
  .put(auth, L2, perm(OWNERSHIP_REQUIRED), uploadBootcampPhoto);

module.exports = router;
