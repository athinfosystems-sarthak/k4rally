const express = require('express');
require('../../config/database')();
require('express-async-errors');
const cors = require('cors');
const { expressjwt: jwt } = require('express-jwt');
const vest_route = require('./vest.routes');
const Users = require('../models/user.model');
const { serverAdapter } = require('../../job_queue/process_manager');
const { JWT_SECRET } = require('../../config/envs');
const Auth = require('../controllers/auth.controller');

const user_auth = new Auth();
module.exports = async function (server) {
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.use(cors({ origin: '*' }));
  serverAdapter.setBasePath('/api/v1/admin/queues');
  server.use('/api/v1/admin/queues/', serverAdapter.getRouter());
  server.use(cors({ origin: '*' }));
  server.use(jwt({ secret: JWT_SECRET, algorithms: ['HS256'] })
    .unless({
      path: [
        '/api/v1/login',

      ],
    }));

  server.use(async (req, res, next) => {
    if (req.auth && req.auth.id) {
      req.user = await Users.findById(req.auth.id);
    }

    next();
  });
  server.use('/api/v1/login', user_auth.login);
  server.use('/api/v1', vest_route);
  server.use('/api/v1/', vest_route);
};
