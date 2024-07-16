const express = require('express');

const router = express.Router();
const { vestController } = require('../controllers/vest.controller');
const { vestStatusUpdate } = require('../services/vest.service');

router.get('/vestDetails', vestController);
router.put('/updateStatus', vestStatusUpdate);
module.exports = router;
