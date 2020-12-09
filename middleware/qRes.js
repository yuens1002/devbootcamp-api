const errorResponse = require('../utils/errorResponse');

const qRes = (Modal, popName = '') => async (req, res, next) => {
  /******************************************************************************
   * perform query/filtering from all bootcamps route
   * query: api/v1/bootcamps/?avgCost[lte]=10000&select=housing,avgCost
   * req.query: { avgCost: { lte: '10000' }, select: 'housing, avgCost' }
   * MongoDB query format: model.find({}).select('field1 field2')
   *
   * todo
   * get the name of the model to set default sort for that model
   ******************************************************************************/

  // console.log('Model: ', typeof Modal);
  let data,
    fields = {};
  const { query: q } = req;
  // console.log('qRes q:', q);

  const fieldsToRemove = ['select', 'sort', 'page', 'limit'];
  const defaultSort = 'createdAt';
  const page = parseInt(q.page, 10) || 1;
  const limit = parseInt(q.limit, 10) || 10;
  const startIdx = (page - 1) * limit;
  const endIdx = page * limit;
  const total = await Modal.countDocuments();

  const pagination = {};
  if (endIdx < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIdx > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  pagination.last = {
    page: Math.ceil(total / limit),
    limit,
  };

  // convert conditions like [lte] to '$lte for mongoDB syntax
  const qStr = (q) =>
    JSON.stringify(q).replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

  // ex. q = {select: 'housing, avgCost', avgCost: '10000'}
  Object.keys(q).forEach((k) => {
    // save to be removed fields, then remove from query
    // ex. {... select: 'housing', 'avgCost', sort: 'location.city',  }
    if (fieldsToRemove.includes(k)) {
      fields[k] = q[k].split(',').join(' ');
      delete q[k];
    }
  });

  data = Modal.find(JSON.parse(qStr(q)));
  // only show projection if select isn't used
  popName && !fields.select && (data = data.populate(popName));
  fields.select && (data = data.select(fields.select));

  // mongoDB query construction
  // async find records from the modal
  try {
    data = await data
      .sort(fields.sort || defaultSort)
      .skip(startIdx)
      .limit(limit);
  } catch (err) {
    next({
      message: 'Looks like a syntax error, pls check syntax and try again',
      statusCode: 500,
    });
  }

  res.qRes = {
    success: true,
    pagination,
    count: data.length,
    data,
  };
  // console.log('res.qRes: ', res.qRes);
  next();
};

module.exports = qRes;
