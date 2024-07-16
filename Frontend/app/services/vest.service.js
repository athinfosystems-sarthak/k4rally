const vestModel = require('../models/vest.model');
const { STATUS } = require('../utils/enumHelper');

module.exports.UserVestDetails = async (pagination, user) => {
  const data = await vestModel.find({ user_id: user._id })
    .skip(pagination.skip)
    .limit(pagination.limit);
  pagination.total = await vestModel.countDocuments({ user_id: user._id });
  return { data, pagination };
};

module.exports.vestStatusUpdate = async (req, res) => {
  const { scheduleId, status } = req.body;
  const data = await vestModel.findOne({ user_id: req.user._id, scheduleId });
  if (data.claim !== STATUS.SUCCESS) {
    data.claim = status === STATUS.PENDING ? STATUS.PENDING : STATUS.FAILED;
    await data.save();
  }
  return res.status(200).send({ msg: 'success', data });
};
