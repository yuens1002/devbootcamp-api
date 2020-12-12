const asyncHandler = require('../utils/asyncHandler');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const {
  roles: { ADMIN, PUBLISHER },
  routes: { CREATE_BOOTCAMP, OWNERSHIP_REQUIRED },
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
    const { role, _id: userId } = req.user;

    const canCreateBootcamp = async () => {
      // console.log('hasCreatedBootcamp: ', userId);
      const foundBootcamp = await Bootcamp.findOne({ user: userId });
      console.log('foundBootcamp: ', foundBootcamp);
      return Boolean(!foundBootcamp);
    };

    const isOwner = async () => {
      console.log('route from isOwner: ', route);

      // routes with '/:id' or '/:bootcampId/courses'
      const bootcampId = req.params.id || req.params.bootcampId;
      const foundBootcamp = await Bootcamp.findOne({ user: userId });

      console.log('isOwner: ', foundBootcamp);
      console.log('req.params.bootcampId: ', req.params.bootcampId);

      // no bootcamp found ==> the owner isnt the logged in user
      return foundBootcamp._id.toString() === bootcampId;
    };

    switch (role) {
      case ADMIN:
        console.log(ADMIN);
        return next();
      case PUBLISHER:
        const permCheck = {
          [CREATE_BOOTCAMP]: canCreateBootcamp,
          [OWNERSHIP_REQUIRED]: isOwner,
        };
        const errMsg = {
          [CREATE_BOOTCAMP]: 'Allowance exceeded',
          [OWNERSHIP_REQUIRED]: 'Ownership required',
        };
        return (await permCheck[route]())
          ? next()
          : next(new ErrorResponse(errMsg[route], 403));
      default:
        return next(new ErrorResponse('Authorization required', 401));
    }
  });
