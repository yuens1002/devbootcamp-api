const { authorization: auth } = require('../middleware/auth/auth');
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
  .post(auth, L2, perm(OWNERSHIP_REQUIRED), createCourse);
router
  .route('/:id')
  .get(getCourse)
  .put(auth, L2, perm(OWNERSHIP_REQUIRED), updateCourse)
  .delete(auth, L2, perm(OWNERSHIP_REQUIRED), deleteCourse);

module.exports = router;
