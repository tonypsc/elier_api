const service = require('./service');
const errorHandling = require('../../error/errorHandling');

const controller = {
	async getYoutube(req, res) {
		try {
			const result = await service.getYoutube(req.query.search);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},

	async getDailyMotion(req, res) {
		try {
			const result = await service.getDailyMotion(req.query.search);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},
};

module.exports = controller;
