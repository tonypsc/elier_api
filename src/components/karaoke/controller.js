const errorHandling = require('../../error/errorHandling');

const service = require('./service');
const searchService = require('./searchService');

const controller = {
	async getKaraokes(req, res) {
		try {
			const result = await searchService.getAll(
				req.query.search,
				req.query.page
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
			const result = await service.addToList(list_id, karaoke_song_id);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},
	async addToFavorites(req, res) {
		try {
			const result = await service.addToList(req.body.karaoke_song_id);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},
};

module.exports = controller;
