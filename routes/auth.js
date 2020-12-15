const router = require('express').Router();
const {
  registerUser,
  userLogin,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  logout,
} = require('../controllers/auth');
const { authorization: auth } = require('../middleware/auth/auth');

router.route('/register').post(registerUser);
router.route('/login').post(userLogin);
router.route('/user').get(auth, getCurrentUser);
router.route('/logout').get(auth, logout);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:sentToken').put(resetPassword);

module.exports = router;
