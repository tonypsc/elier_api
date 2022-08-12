const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.get('/searchyoutube', controller.getYoutube);

module.exports = router;
