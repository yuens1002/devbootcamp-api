// @desc      Create a bootcamp
// @route     POST /api/v1/bootcamps/
// @access    Private
exports.createBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'create a new bootcamp' });
};

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps/
// @access    Public
exports.getAllBootcamps = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'show all bootcamps' });
};

// @desc      Get a bootcamp
// @route     GET /api/v1/bootcamp/:id
// @access    Private
exports.getBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `show bootcamp: ${req.params.id}` });
};

// @desc      Update a bootcamp
// @route     PUT /api/v1/bootcamp/:id
// @access    Private
exports.updateBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `update bootcamp: ${req.params.id}` });
};

// @desc      Delete a bootcamp
// @route     DELETE /api/v1/bootcamp/:id
// @access    Private
exports.deleteBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `delete bootcamp: ${req.params.id}` });
};
