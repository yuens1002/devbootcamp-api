const router = require('express').Router();
const { access } = require('../middleware/auth/auth');
const {
  registerUser,
  userLogin,
  getCurrentUser,
} = require('../controllers/auth');

router.route('/register').post(registerUser);
router.route('/login').post(userLogin);
// router.route('/user').get(access, getCurrentUser);

module.exports = router;
