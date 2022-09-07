const CustomError = require('../../error/CustomError');

const sharedRepository = require('../shared/SharedRepository');
const config = require('../../config');

const repository = new sharedRepository('list', 'list_id');

const service = {
	// Adds play list to lists table
	async addList(listName) {
		if (!listName) throw new CustomError('List name is required');
	},
};

module.exports = service;
