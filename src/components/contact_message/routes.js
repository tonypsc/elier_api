const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.get('/', controller.get);
router.post('/new', controller.add);

module.exports = router;
