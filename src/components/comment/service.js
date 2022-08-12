const sharedRepository = require('../shared/SharedRepository');
const repository = new sharedRepository('comment', 'comment_id');

const service = {
	add(comment) {
		return repository.insert(comment);
	},
	delete(comment_id) {
		return repository.delete(comment_id);
	},
};

module.exports = service;
