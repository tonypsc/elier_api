const service = require('./service');
const errorHandling = require('../../error/errorHandling');

const controller = {
	// creates new user list for the app
	async createList(req, res) {
		try {
			const { user_id, app_id, list_name } = req.body;
			const result = await service.add(user_id, app_id, list_name);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},
	// gets all lists for the user and the app
	async getLists(req, res) {
		try {
			const result = await service.getAll(req.query.user_id, req.query.app_id);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},
	// updates list name
	async updateList(req, res) {
		try {
			const result = await service.update(req.body.list_id, req.body.name);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},
	// delete list
	async deleteList(req, res) {
		try {
			const result = await service.delete(req.query.list_id);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},
};

module.exports = controller;
