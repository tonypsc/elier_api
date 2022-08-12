const express = require('express');
const jwt = require('../middleware/jwtauth');
const userRoutes = require('../components/user/routes');
const notificationRoutes = require('../components/notification/routes');
const contactMessagesRoutes = require('../components/contact_message/routes');
const karaokeRoutes = require('../components/karaoke/routes');

//const path = require('path');

const router = express.Router();

router.use('/users', jwt.authenticateToken, userRoutes);
router.use('/notifications', jwt.authenticateToken, notificationRoutes);
router.use('/contactmessages', jwt.authenticateToken, contactMessagesRoutes);
router.use('/karaoke', jwt.authenticateToken, karaokeRoutes);

router.all('*', (req, res) => {
	res.sendStatus(404);
});

// this is needed for serving front as static
// router.all('*', (req, res) => {
// 	res.sendFile(path.join(__dirname, '../../public/index.html'));
// });

module.exports = router;
