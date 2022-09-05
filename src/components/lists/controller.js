const service = require('./service');
const errorHandling = require('../../error/errorHandling');

const controller = {
	// creates new user list
	async createList(req, res) {
		try {
			const result = await service.addList(req.body.listName);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},
};

module.exports = controller;
