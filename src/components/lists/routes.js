const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.get('/', controller.getLists);
router.post('/', controller.createList);

module.exports = router;
