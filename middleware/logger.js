// @desc     logs request method and url to console
exports.logger = (req, _, next) => {
  console.log(
    `${req.method} ${req.protocol}//${req.get('host')}${req.originalURL}`
  );
  next();
};
