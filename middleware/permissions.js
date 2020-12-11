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

const errMsg = {
  [CREATE_BOOTCAMP]: {
    message: 'Access restricted or role limitation',
    statusCode: 400,
  },
  [OWNERSHIP_REQUIRED]: {
    message: 'Access restricted or ownership permission required',
    statusCode: 400,
  },
};

exports.permissions = (route) =>
  asyncHandler(async (req, res, next) => {
    const { role, _id: userId } = req.user;

    const bootcampByUserId = async () => {
      return await Bootcamp.findOne({ user: userId });
    };

    const hasCreatedBootcamp = async () => {
      // console.log('hasCreatedBootcamp: ', userId);
      const foundBootcamp = await bootcampByUserId(userId);
      // console.log('foundBootcamp: ', foundBootcamp);
      return foundBootcamp
        ? next(new ErrorResponse(errMsg[route].message, 400))
        : next();
    };

    const isOwner = async () => {
      const bootcamp = await bootcampByUserId();
      // no bootcamp found ==> the owner isnt the logged in user

      return bootcamp._id.toString() === req.params.id
        ? next()
        : next(new ErrorResponse(errMsg[route].message, 400));
    };

    switch (role) {
      case ADMIN:
        return next();
      case PUBLISHER:
        // return publisherRoutes[route];
        return route === CREATE_BOOTCAMP ? !hasCreatedBootcamp() : isOwner();
      default:
        return next(new ErrorResponse('Permission required', 400));
    }
  });

// const hasPerm = ({ userId = '', role = '', route = '', req = {} }) => {
//   const publisherRoutes = {
//     [CREATE_BOOTCAMP]: () => !hasCreatedBootcamp(userId),
//     [PH_URD_BOOTCAMP]: () => isOwner(userId, req.params.id),
//   };
//   switch (role) {
//     case ADMIN:
//       return true;
//     case PUBLISHER:
//       // return publisherRoutes[route];
//       return route === CREATE_BOOTCAMP
//         ? !hasCreatedBootcamp(userId)
//         : isOwner(userId, req.params.id);
//     default:
//       return false;
//   }
// };

// const bootcampByUserId = async (userId) => {
//   // console.log(
//   //   '🚀 ~ file: permissions.js ~ line 63 ~ bootcampByUserId ~ userId',
//   //   userId
//   // );
//   return await Bootcamp.findOne({ user: userId });
// };

// const hasCreatedBootcamp = async (userId) => {
//   // console.log('hasCreatedBootcamp: ', userId);
//   const foundBootcamp = await bootcampByUserId(userId);
//   console.log('foundBootcamp: ', foundBootcamp);
//   return foundBootcamp;
// };

// const isOwner = async (userId, bootcampId) => {
//   // if ownerId === userId
//   // console.log('bootcampId from req: ', bootcampId);
//   const bootcamp = await bootcampByUserId(userId);
//   // no bootcamp found ==> the owner isnt the logged in user
//   // console.log('bootcamp from model: ', bootcamp.id);
//   return !bootcamp ? false : bootcamp.id === bootcampId;
// };
