const router = require('express').Router();
const { authorization: auth } = require('../middleware/auth/auth');
const { getCurrentUser } = require('../controllers/user');

router.route('/').get(auth, getCurrentUser);

module.exports = router;
