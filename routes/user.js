const router = require('express').Router();
const { access } = require('../middleware/auth/auth');
const { getCurrentUser } = require('../controllers/user');

router.route('/').get(access, getCurrentUser);

module.exports = router;
