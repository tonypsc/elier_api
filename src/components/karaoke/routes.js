const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.get('/searchyoutube', controller.getYoutube);
router.get('/searchdailymotion', controller.getDailyMotion);

module.exports = router;
