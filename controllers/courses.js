const asyncHandler = require('../utils/asyncHandler');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

/*
 * Course CRUD
 */

// @desc      Create a course for a specific bootcamp
// @route     POST /api/v1/bootcamps/:bootcampId/courses
// @access    Private
exports.createCourse = asyncHandler(async (req, res, next) => {
  const { params: { bootcampId } = {} } = req;
  // console.log('bootcampId: ', bootcampId);
  // set bootcamp id to the body of the request
  req.body.bootcamp = bootcampId;
  req.body.user = userId;
  // need to be sure the bootcamp exists before adding a course to it
  const bootcamp = await Bootcamp.findById(bootcampId);

  if (bootcamp) {
    const data = await Course.create(req.body);
    const course = await Course.findById(data.id).populate({
      path: 'bootcamp',
      select: 'name description',
    });
    res.status(201).json({ success: true, data: course });
  } else {
    next({
      message: `Bootcamp not found with the id of ${bootcampId}`,
      statusCode: 404,
    });
  }
});

// @desc      Get all courses
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public
exports.getAllCourses = asyncHandler(async (req, res, next) => {
  const { params: { bootcampId } = '' } = req;
  if (bootcampId) {
    try {
      const data = await Course.find({ bootcamp: bootcampId });
      res.status(200).json({ success: true, count: data.length, data });
    } catch (err) {
      next({
        // bootcamp not found b/c that's the id being passed for the query
        message: `Bootcamp not found with the id of ${bootcampId}`,
        statusCode: 404,
      });
    }
  }
  res.status(200).json(res.qRes);
});

// @desc      Get a course by id
// @route     GET /api/v1/courses/:id
// @access    Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  // console.log('p', p);
  const data = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  data
    ? res.status(200).json({ success: true, data })
    : next({
        message: `Course not found with the id of ${req.params.id}`,
        statusCode: 404,
      });
});

// @desc      Update a course from a specific bootcamp
// @route     PUT /api/v1/courses/:id
// @access    Private
// @todo      updating course tuition also needs to trigger recalculate avgCost
exports.updateCourse = asyncHandler(async (req, res, next) => {
  const { params: { id: courseId } = {} } = req;
  // console.log('courseId: ', courseId);

  // need to be sure the bootcamp exists before adding a course to it
  const course = await Course.findByIdAndUpdate(courseId, req.body, {
    new: true,
    runValidators: true,
  }).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  course
    ? res.status(201).json({ success: true, data: course })
    : next({
        message: `Bootcamp not found with the id of ${bootcampId}`,
        statusCode: 404,
      });
});

// @desc      Delete a course from a specific bootcamp
// @route     DELETE /api/v1/courses/:id
// @access    Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const { params: { id: courseId } = {} } = req;
  const course = await Course.findById(courseId);
  // need to be sure the bootcamp exists to account for course not found
  try {
    await course.remove();
  } catch (err) {
    next({
      message: `Course not found with the id of ${courseId}`,
      statusCode: 404,
    });
  }
  res.status(200).json({ success: true, data: {} });
});
