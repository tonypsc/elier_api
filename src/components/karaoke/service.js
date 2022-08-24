const fetch = require('node-fetch');

const sharedRepository = require('../shared/SharedRepository');

const config = require('../../config');

const repository = new sharedRepository('karaoke', 'karaoke_id');

const service = {
	// Calls youtube API to get search results
	async getYoutube(search) {
		const youtubeUrl =
			'https://youtube.googleapis.com/youtube/v3/search?type=video&maxResults=20&part=snippet&q=karaoke ';

		https: try {
			const res = await fetch(
				`${youtubeUrl}${search}&key=${config.GOOGLE_API_KEY}`
			);
			const data = await res.json();

			const result = data.items.map((res) => {
				res.link = `www.youtube.com/watch?v=${res.id.videoId}`;
				return res;
			});

			return result;
		} catch (err) {
			console.log(err);
			return false;
		}
	},
};

module.exports = service;
