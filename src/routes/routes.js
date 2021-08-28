const express = require('express');
const jwt = require('../middleware/jwtauth');
const userRoutes = require('../components/user/routes');

//const path = require('path');

const router = express.Router();

router.use('/users', jwt.authenticateToken, userRoutes);

// this is needed for serving angular front as static
// router.all('*', (req, res) => {
// 	res.sendFile(path.join(__dirname, '../../public/index.html'));
// });

module.exports = router;
