const errorHandling = require('../../error/errorHandling');
const service = require('./service');

const controller = {
	async add(req, res) {
		try {
			const { email, name, phone, message } = req.body;
			const result = await service.add(email, name, phone, message);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	async get(req, res) {
		try {
			console.log(req.query.search);
			const result = await service.get(req.query.search);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},
};

module.exports = controller;
