const { access } = require('../middleware/auth/auth');
const { L2 } = require('../middleware/auth/authLevels');
const router = require('express').Router({ mergeParams: true });
const {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');
const Course = require('../models/Course');
const qRes = require('../middleware/qRes');
const { permissions: perm } = require('../middleware/permissions');
const {
  routes: { OWNERSHIP_REQUIRED },
} = require('../consts/enums');

// look at the routes, it's merged from bootcamps
router
  .route('/')
  // 'bootcamp' the property name of the projection set in the Model
  .get(qRes(Course, 'bootcamp'), getAllCourses)
  .post(access, L2, perm(OWNERSHIP_REQUIRED));
router
  .route('/:id')
  .get(getCourse)
  .put(access, L2, perm(OWNERSHIP_REQUIRED))
  .delete(access, L2, perm(OWNERSHIP_REQUIRED));

module.exports = router;
