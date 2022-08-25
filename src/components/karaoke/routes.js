const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.get('/searchkaraokes', controller.getKaraokes);

module.exports = router;
