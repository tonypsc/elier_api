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
				res.link = `https://www.youtube.com/watch?v=${res.id.videoId}`;
				return res;
			});

			return result;
		} catch (err) {
			console.log(err);
			return false;
		}
	},

	// Calls daily API to get search results
	async getDailyMotion(search) {
		const youtubeUrl =
			'https://api.dailymotion.com/videos?shorter_than=10&fields=id,title,thumbnail_url&search=karaoke ';

		https: try {
			const res = await fetch(`${youtubeUrl}${search}`);
			const data = await res.json();

			const result = data.list.map((res) => {
				res.link = `https://www.dailymotion.com/video/${res.id}`;
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
