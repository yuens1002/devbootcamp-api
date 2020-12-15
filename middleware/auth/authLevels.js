const { authorize } = require('./auth');
const {
  roles: { USER, ADMIN, PUBLISHER },
} = require('../../consts/enums');

const level = {
  L1: [USER],
  L2: [PUBLISHER, ADMIN],
  L3: [ADMIN],
  L4: [ADMIN, USER],
};

exports.L1 = authorize(level.L1);
exports.L2 = authorize(level.L2);
exports.L3 = authorize(level.L3);
exports.L4 = authorize(level.L4);
