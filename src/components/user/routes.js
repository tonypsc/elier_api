const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.post('/login', controller.login);
router.post('/recoverpwd', controller.recover);
router.get('/recoverpwd/:id', controller.verifyLink);
router.post('/setpwd', controller.resetPassword);
router.post('/newpwd', controller.setPassword);
router.post('/changepwd', controller.changePassword);
router.post('/register', controller.register);
router.post('/resendconfirmation', controller.sendConfirmationLink); // resends confirmation link to user
router.get('/confirmregister/:link', controller.confirmRegister);
router.get('/', controller.get);
router.get('/userexists', controller.exists);
router.get('/:id', controller.getOne);
router.patch('/', controller.update);
router.patch('/profile', controller.updateProfile);
router.patch('/photo', controller.updatePhoto);
router.patch('/language', controller.updateLanguage);
router.delete('/:id', controller.delete);

module.exports = router;
