const router = require('express').Router({ mergeParams: true });
const { authorization: auth } = require('../middleware/auth/auth');
const { L2 } = require('../middleware/auth/authLevels');
const { permissions: perm } = require('../middleware/permissions');

const Course = require('../models/Course');
const qRes = require('../middleware/qRes');
const {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');

const {
  routes: { BOOTCAMP_OWNERSHIP, UPDATE_DEL_COURSE },
} = require('../consts/enums');

// look at the routes, it's merged from bootcamps
router
  .route('/')
  // 'bootcamp' the property name of the projection set in the Model
  .get(qRes(Course, 'bootcamp'), getAllCourses)
  .post(auth, L2, perm(BOOTCAMP_OWNERSHIP), createCourse);
router
  .route('/:id')
  .get(getCourse)
  .put(auth, L2, perm(UPDATE_DEL_COURSE), updateCourse)
  .delete(auth, L2, perm(UPDATE_DEL_COURSE), deleteCourse);

module.exports = router;
