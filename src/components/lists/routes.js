const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.post('/list', controller.createList);

module.exports = router;
