const service = require('./service');
const errorHandling = require('../../error/errorHandling');

const controller = {
	// creates new user list for the app
	async createList(req, res) {
		try {
			const { user_id, app_id, list_name } = req.body;
			const result = await service.addList(user_id, app_id, list_name);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},
};

module.exports = controller;
