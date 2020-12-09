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

// look at the routes, it's merged from bootcamps
router
  .route('/')
  .get(qRes(Course, 'bootcamp'), getAllCourses)
  .post(access, L2, createCourse);
router
  .route('/:id')
  .get(getCourse)
  .put(access, L2, updateCourse)
  .delete(access, L2, deleteCourse);

module.exports = router;
