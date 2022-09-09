const errorHandling = require('../../error/errorHandling');
const service = require('./service');

const controller = {
	/**
	 * Handles the new message creation request
	 */
	async add(req, res) {
		try {
			const { email, name, phone, message } = req.body;
			const captcha = req.body['g-recaptcha-response'];

			const result = await service.add(
				email,
				name,
				phone,
				message,
				captcha,
				req.connection.remoteAddress.split(':').slice(-1)[0]
			);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	async get(req, res) {
		try {
			const result = await service.get(req.query.search);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},
};

module.exports = controller;
