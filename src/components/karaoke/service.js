const fetch = require('node-fetch');

const sharedRepository = require('../shared/SharedRepository');

const config = require('../../config');

const repository = new sharedRepository('karaoke', 'karaoke_id');

const service = {
	// Calls youtube API to get search results
	async getYoutube(search) {
		const youtubeUrl =
			'https://youtube.googleapis.com/youtube/v3/search?type=video&q=karaoke ';

		try {
			const res = await fetch(
				`${youtubeUrl}${search}&key=${config.GOOGLE_API_KEY}`
			);
			const data = await res.json();
			console.log(data);
			return data;
		} catch (err) {
			console.log(err);
			return false;
		}
	},
};

module.exports = service;
