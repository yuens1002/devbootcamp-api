const User = require('../models/User');
const router = require('express').Router();

const qRes = require('../middleware/qRes');
const { authorization: auth } = require('../middleware/auth/auth');
const { L3 } = require('../middleware/auth/authLevels');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/admin');

router.use(auth);
router.use(L3);

router.route('/').get(qRes(User), getAllUsers).post(createUser);

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
