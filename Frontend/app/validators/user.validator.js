const Joi = require('joi');

const validateUserId = (body) => {
  const schema = Joi.object({
    walletAddress: Joi.string().required(),

  });
  const result = schema.validate(body);
  return result;
};

module.exports = {
  validateUserId,
};
