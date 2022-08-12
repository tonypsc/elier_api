const service = require('./service');
const errorHandling = require('../../error/errorHandling');

const controller = {
	async get(req, res) {
		try {
			const result = await service.get(req.params.link);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},
	async create(req, res) {
		try {
			const result = await service.get(req.params.link);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},
	async delete(req, res) {
		try {
			const result = await service.get(req.params.link);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},
};

module.exports = controller;
