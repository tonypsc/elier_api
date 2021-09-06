const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.get('/:id', controller.get);
router.post('/', controller.create);
router.patch('/markread/:id', controller.marckRead);
router.patch('/markreaduser/:id', controller.marckReadUser);

module.exports = router;
