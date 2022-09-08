const CustomError = require('../../error/CustomError');

const sharedRepository = require('../shared/SharedRepository');
const config = require('../../config');

const repository = new sharedRepository('list', 'list_id');

const uiFields = ['list_id', 'name'];

const service = {
	// Adds play list to lists table
	async add(user_id, app_id, listName) {
		if (!user_id || !app_id) throw new CustomError('Invalid input data');
		if (!listName || listName.toString().trim().length === 0)
			throw new CustomError('List name is required');
		if (listName.length > 100)
			throw new CustomError('List name too long (100 max)');

		const newList = {
			list_id: repository.getUUID(),
			user_id,
			app_id,
			name: listName,
			created_at: new Date().getTime(),
		};

		return repository.insert(newList);
	},
	async getAll(user_id, app_id) {
		if (!user_id || !app_id) throw new CustomError('Invalid input data');
		return repository.getAll({ user_id, app_id }, uiFields);
	},
};

module.exports = service;