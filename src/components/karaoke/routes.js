const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.get('/search', controller.getKaraokes);
router.post('/addtolist', controller.addTolist);

module.exports = router;
