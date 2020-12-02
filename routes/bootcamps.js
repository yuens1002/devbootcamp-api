const router = require('express').Router();
const {
  createBootcamp,
  getAllBootcamps,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
} = require('../controllers/bootcamps');

router.route('/').get(getAllBootcamps).post(createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
