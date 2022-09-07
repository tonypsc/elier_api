const jwt = require('jsonwebtoken');

module.exports = {
	generateToken(payload) {
		const token = jwt.sign(payload, process.env.TOKEN_SECRET, {
			expiresIn: '180000s',
		});
		return token;
	},

	authenticateToken(req, res, next) {
		const excludedPaths = [
			'/login',
			'/recoverpwd',
			'/setpwd',
			'/uploads',
			'/register',
			'/confirmregister',
			'/resendconfirmation',
			'/newmessage',
			'/userexists',
			'/search',
		];

		for (const path of excludedPaths) {
			if (req.path.includes(path)) {
				next();
				return;
			}
		}

		const authHeader = req.header('authorization');
		const token = authHeader && authHeader.split(' ')[1];

		if (token == null) return res.sendStatus(401);

		jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
			//console.log(err);
			if (err) {
				res.status = 403;
				res.json({ status: 'error', errors: 'Forbiden' });
				//res.sendStatus(403);
			}
			req.user = data;
			next();
		});
	},
};
