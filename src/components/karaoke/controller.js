const service = require('./service');
const errorHandling = require('../../error/errorHandling');

const controller = {
	async getKaraokes(req, res) {
		try {
			const result = await service.getAll(req.query.search, req.query.page);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},
};

module.exports = controller;
