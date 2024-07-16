const { UserVestDetails } = require('../services/vest.service');
const { getPagination } = require('../utils/pagination');

module.exports.vestController = async (req, res) => {
  const pagination = getPagination(req.query);
  const data = await UserVestDetails(pagination, req.user);
  return res.status(200).json({ msg: 'success', data });
};
