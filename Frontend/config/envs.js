const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, './env/.env') });

module.exports = {
  MONGODB_CONNECTION_STRING: process.env.MONGODB_CONNECTION_STRING,
  PORT: process.env.PORT || 8100,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  JWT_SECRET: process.env.JWT_SECRET || 'topSecert',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',

};
