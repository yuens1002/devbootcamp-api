const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../utils/asyncHandler');
const geocoder = require('../utils/geocoder.js');
const path = require('path');

// @desc      Create a bootcamp
// @route     POST /api/v1/bootcamps/
// @access    Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const data = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data });
});

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getAllBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.qRes);
});

// @desc      Get a bootcamp
// @route     GET /api/v1/bootcamps/:id
// @access    Private
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const data = await Bootcamp.findById(req.params.id).populate('courses');
  res.status(200).json({ success: true, data });
});

// @desc      Update a bootcamp
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  // if found, req.body is returned
  const data = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // catch non db error - record not found if _id format passes
  data
    ? res.status(200).json({ success: true, data })
    : next({ message: `Bootcamp not found with id of ${id}`, statusCode: 404 });
});

// @desc      Delete a bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const data = await Bootcamp.findById(req.params.id);

  // using remove instead of findByIdAndRemove here so a pre middleware can detect the removal
  data.remove();

  data
    ? res.status(200).json({ success: true, data: {} })
    : next({ message: `Bootcamp not found with id of ${id}`, statusCode: 404 });
});

// @desc      Get Bootcamp(s) by zipcode/radius
// @route     GET /api/v1/bootcamps/radius/:zip/:distance
// @access    Private
exports.getBootcampWithinRadius = asyncHandler(async (req, res, next) => {
  // get lat/lng from geocoder
  const {
    params: { zip, distance },
  } = req;
  const loc = await geocoder.geocode(zip);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // calc radius using radians
  // divide distance by radius of earth
  // earth radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const data = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });

  data.length
    ? res.status(200).json({ success: true, count: data.length, data })
    : next({
        message: `No bootcamp found with distance of ${distance} mi from ${zip}`,
        statusCode: 404,
      });
});

// @desc      Upload a photo for a bootcamp
// @route     PUT /api/v1/bootcamps/:id/photo
// @access    Private
exports.uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
    files,
  } = req;
  console.log(files, id);
  const bootcamp = await Bootcamp.findById(id);
  if (!bootcamp)
    return next({
      message: `Bootcamp not found with id of ${id}`,
      statusCode: 404,
    });

  if (!files) {
    return next({
      message: `Please upload a file`,
      statusCode: 400,
    });
  }

  const { file } = files;
  if (!file.mimetype.startsWith('image')) {
    return next({
      message: `Please upload an image file`,
      statusCode: 400,
    });
  }
  if (files.size > process.env.MAX_FILE_UPLOAD_SIZE) {
    return next({
      message: `Please upload a file size less than ${process.env.MAX_FILE_UPLOAD_SIZE}`,
      statusCode: 400,
    });
  }
  //this works b/c there is only 1 file per bootcamp
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  // move file with a custom name
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      return next({
        message: `Not able to upload/process the file`,
        statusCode: 500,
      });
    }
    await Bootcamp.findByIdAndUpdate(id, { photo: file.name });
    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
