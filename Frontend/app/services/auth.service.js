/* eslint-disable import/no-extraneous-dependencies */
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const { JWT_EXPIRES_IN, JWT_SECRET } = require('../../config/envs');
const { InvalidInputError } = require('../error/invalid_input_error');
// eslint-disable-next-line consistent-return
module.exports.recoverAddress = async (message, signature) => {
  try {
    const signerAddr = await ethers.verifyMessage(message, signature);
    return signerAddr;
  } catch (error) {
    throw new InvalidInputError(error.message);
  }
};

// eslint-disable-next-line consistent-return
module.exports.generateJwtToken = async (id) => {
  try {
    const token = await jwt.sign({ id: id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    return token;
  } catch (error) {
    throw new InvalidInputError(error.message);
  }
};
