const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.get('/', controller.get);
router.post('/', controller.create);
router.delete('/', controller.delete);

module.exports = router;
