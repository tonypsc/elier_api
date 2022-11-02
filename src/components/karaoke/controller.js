const errorHandling = require('../../error/errorHandling');

//const karaokeService = require('./karaokeService');
const searchService = require('./searchService');
const listService = require('./listService');

const controller = {
	async getKaraokes(req, res) {
		try {
			const { search, page, nextPageToken, perPage } = req.query;

			const result = await searchService.getAll(
				search,
				page,
				nextPageToken,
				perPage
			);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},
	async addToList(req, res) {
		try {
			const { list_id, karaoke_song_id } = req.body;
			const result = await listService.addToList(list_id, karaoke_song_id);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},
	async addToFavorites(req, res) {
		try {
			const result = await listService.addToList(req.body.karaoke_song_id);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},
};

module.exports = controller;
