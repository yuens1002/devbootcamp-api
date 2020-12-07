const router = require('express').Router();
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

// include course routes
const courseRoutes = require('./courses');
// re-route into other resource routes
router.use('/:bootcampId/courses', courseRoutes);

router.route('/radius/:zip/:distance').get(getBootcampWithinRadius);

router
  .route('/')
  .get(qRes(Bootcamp, 'courses'), getAllBootcamps)
  .post(createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

router.route('/:id/photo').put(uploadBootcampPhoto);

module.exports = router;
