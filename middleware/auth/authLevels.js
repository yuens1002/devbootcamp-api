const { authorize } = require('./auth');
const ADMIN = 'admin';
const PUBLISHER = 'publisher';
const USER = 'user';

const level = {
  L1: [USER],
  L2: [PUBLISHER, ADMIN],
};

exports.L1 = authorize(level.L1);
exports.L2 = authorize(level.L2);
