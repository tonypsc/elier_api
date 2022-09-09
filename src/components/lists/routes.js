const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.get('/', controller.getLists);
router.post('/', controller.createList);
router.put('/', controller.updateList);
router.delete('/', controller.deleteList);

module.exports = router;

