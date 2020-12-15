const Bootcamp = require('../models/Bootcamp');
const Course = require('../models/Course');
const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const {
  roles: { ADMIN, PUBLISHER, USER },
  routes: {
    CREATE_BOOTCAMP,
    BOOTCAMP_OWNERSHIP,
    UPDATE_DEL_COURSE,
    REVIEW_OWNERSHIP,
  },
} = require('../consts/enums');

/************************************************************************
permission structure

const perms = {
  admin: ['no restrictions'],
  publisher: [
    'create one bootcamp', 
    '_RUD his/her own bootcamp', 
    '_RUD his/her own bootcamp courses', 
    '_RUD his/her own bootcamp reviews',
    'update photo',
    'radius'
  ],
  user: [
    'CRUD review(s) on a course the user has registered',
    'R bootcamps,
    'R courses,
    'radius',
  ]
}

***********************************************************************/

exports.permissions = (route) =>
  asyncHandler(async (req, res, next) => {
    // console.log(`route from permission: ${route}`.red);
    // console.log(`route from permission: ${req.params.id}`.green.inverse);
    const { role, _id: userId } = req.user;

    const canCreateBootcamp = async () => {
      // console.log('hasCreatedBootcamp: ', userId);
      const foundBootcamp = await Bootcamp.findOne({ user: userId });
      // console.log('foundBootcamp: ', foundBootcamp);
      return Boolean(!foundBootcamp);
    };

    const isBootcampOwner = async () => {
      // routes with '/:id' or '/:bootcampId/courses'
      const bootcampId = req.params.id || req.params.bootcampId;
      if (!(await Bootcamp.findById(bootcampId))) {
        throw new ErrorResponse(
          `Bootcamp not found with the id of ${bootcampId}`,
          404
        );
      }
      const foundBootcamp = await Bootcamp.findOne({ user: userId });
      // possibility a publisher hasn't created a bootcamp
      if (!foundBootcamp) {
        throw new ErrorResponse(
          'Please create a bootcamp first before adding a course',
          400
        );
      }
      return foundBootcamp._id.toString() === bootcampId;
    };

    const isReviewOwner = async () => {
      const review = await Review.findById(req.params.id);
      if (!review) {
        throw new ErrorResponse(
          `Review not found with id ${req.params.id}`,
          404
        );
      }
      return review.user.toString() === req.user.id;
    };

    const isCourseOwner = async () => {
      const courseId = req.params.id;
      const course = await Course.findById(courseId);
      // in case course isn't found
      if (!course) {
        throw new ErrorResponse(
          `Course not found with the id of ${courseId}`,
          404
        );
      }
      return course.user.toString() === userId.toString();
    };

    /******************************************************
     * should refactor cases to check for route and role,
     * due to forgoing all error checking from controllers
     ******************************************************/

    switch (role) {
      case ADMIN:
        if (route === REVIEW_OWNERSHIP) {
          // for error checking
          await isReviewOwner();
          return next();
        }
        return next();
      case PUBLISHER:
        const errMsg = {
          [CREATE_BOOTCAMP]: 'Allowance exceeded',
          [BOOTCAMP_OWNERSHIP]: 'Bootcamp ownership required',
          [UPDATE_DEL_COURSE]: 'Course ownership required',
        };
        const permCheck = {
          [CREATE_BOOTCAMP]: canCreateBootcamp,
          [BOOTCAMP_OWNERSHIP]: isBootcampOwner,
          [UPDATE_DEL_COURSE]: isCourseOwner,
        };
        if (!permCheck[route]) break;
        return (await permCheck[route]())
          ? next()
          : next(new ErrorResponse(errMsg[route], 403));
      case USER:
        if (route !== REVIEW_OWNERSHIP) break;
        return (await isReviewOwner())
          ? next()
          : next(new ErrorResponse('Review ownership required', 403));
      default:
        return next(new ErrorResponse('Authorization required', 401));
    }
  });
