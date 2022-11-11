const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.get('/search', controller.getKaraokes);
router.get('/getone', controller.getKaraoke);

module.exports = router;
