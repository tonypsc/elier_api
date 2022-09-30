const CustomError = require('../../error/CustomError');

const listService = {
	async addToList(list_id, karaoke_song_id) {
		if (!list_id || !karaoke_song_id)
			throw new CustomError('Invalid input data');

		// add to karaoke_song if not found
	},
};

module.exports = listService;
