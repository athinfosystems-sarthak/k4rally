const express = require('express');

const server = express();
require('dotenv').config();
require('./routers/index')(server);

module.exports = server;
