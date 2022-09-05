const fetch = require('node-fetch');
const stringSimilarity = require('string-similarity');

const sharedRepository = require('../shared/SharedRepository');
const config = require('../../config');

const repository = new sharedRepository('list', 'list_id');

const service = {
	// Adds play list to lists table
	addList(playListName) {
		if (!playListName) throw new Error('List name is required');
	},
};

module.exports = service;
