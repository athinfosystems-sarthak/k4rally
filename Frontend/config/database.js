const mongoose = require('mongoose');
const logger = require('log4js').getLogger('database Connected');
const { MONGODB_CONNECTION_STRING } = require('./envs');

module.exports = async function (connection_string = MONGODB_CONNECTION_STRING) {
  mongoose.connect(connection_string).then(() => logger.info('connected to Database'));
  mongoose.connection.on('connected', () => {
    logger.info('database connected successfully');
  });

  mongoose.connection.on('error', () => {
    logger.error('error with database connection');
  });

  mongoose.connection.on('disconnected', () => {
    logger.error('Mongoose default connection is disconnected');
  });

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      logger.error('Mongoose default connection is disconnected, due to application termination');
      process.exit(0);
    });
  });
};
