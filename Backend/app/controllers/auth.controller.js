const logger = require('log4js').getLogger('user_auth');
const User = require('../models/user.model');
const { recoverAddress, generateJwtToken } = require('../services/auth.service');

const FRONTEND_MESSAGE_TO_SIGN = 'Please sign this message to connect.';
class Auth {
  async login(req, res) {
    const { walletSignature } = req.body;
    if (!walletSignature) {
      logger.error('you should provide a valid signature');
    }
    logger.debug('login called with signature');
    const publicAddress = await recoverAddress(FRONTEND_MESSAGE_TO_SIGN, walletSignature);
    const user = await User.findOne({
      walletAddress: publicAddress.toLowerCase(),
    });

    let newUser;
    if (!user) {
      newUser = new User({
        walletAddress: publicAddress.toLowerCase(),
      });
      await newUser.save();
      logger.info(`new user registered with this address ${publicAddress.toLowerCase()}`);
    }
    let jwt_token;

    if (newUser) {
      jwt_token = await generateJwtToken(newUser._id);
    } else {
      jwt_token = await generateJwtToken(user._id);
    }

    return res.send({
      success: true,
      user: user || newUser,
      jwt_token: jwt_token,
    });
  }
}

module.exports = Auth;
