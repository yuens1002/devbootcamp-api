const asyncHandler = require('../utils/asyncHandler');
const Course = require('../models/Course');

/*
 * Course CRUD
 */

// @desc      Create a course for a specific bootcamp
// @route     POST /api/v1/bootcamps/:bootcampId/courses
// @access    Private
exports.createCourse = asyncHandler(async (req, res, next) => {
  const { bootcampId = '' } = req.params;
  const { _id: userId = '' } = req.user;
  // console.log('bootcampId: ', bootcampId);
  // set bootcamp id to the body of the request
  req.body.bootcamp = bootcampId;
  req.body.user = userId;
  // course validity already checked in permissions
  const data = await Course.create(req.body);
  const course = await Course.findById(data.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  res.status(201).json({ success: true, data: course });
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

// @desc      Get all courses & courses of a bootcamp
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public
exports.getAllCourses = asyncHandler(async (req, res, next) => {
  const { params: { bootcampId } = '' } = req;
  if (bootcampId) {
    const data = await Course.find({ bootcamp: bootcampId });
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

// @desc      Update a course from a bootcamp
// @route     PUT /api/v1/courses/:id
// @access    Private
// @todo      updating course tuition also needs to trigger recalculate avgCost
exports.updateCourse = asyncHandler(async (req, res, next) => {
  const { params: { id: courseId } = {} } = req;

  // course validity is checked in permissions
  const data = await Course.findByIdAndUpdate(courseId, req.body, {
    new: true,
    runValidators: true,
  }).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  res.status(201).json({ success: true, data });
});

// @desc      Delete a course from a specific bootcamp
// @route     DELETE /api/v1/courses/:id
// @access    Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const { id: courseId = '' } = req.params;
  // course validity already done from permissions
  const course = await Course.findById(courseId);
  // for post middleware to delete course removal to re-cal avgCost
  await course.remove();
  res.status(200).json({ success: true, data: {} });
});
