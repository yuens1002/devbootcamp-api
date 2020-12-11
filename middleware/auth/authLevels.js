const { authorize } = require('./auth');
const {
  roles: { USER, ADMIN, PUBLISHER },
} = require('../../consts/enums');

const level = {
  L1: [USER],
  L2: [PUBLISHER, ADMIN],
};

exports.L1 = authorize(level.L1);
exports.L2 = authorize(level.L2);
