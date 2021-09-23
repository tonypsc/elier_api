const service = require('./service');
const errorHandling = require('../../error/errorHandling');

const controller = {
	async get(req, res) {
		try {
			const result = await service.getAll(req.params.id);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	async create(req, res) {
		try {
			const { user_id, title, notification, url } = req.body;
			const result = await service.add(user_id, title, notification, url);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	async markRead(req, res) {
		try {
			const result = await service.markRead(req.params.id);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	async markReadUser(req, res) {
		try {
			const result = await service.markAllUser(req.params.id);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},
};

module.exports = controller;
