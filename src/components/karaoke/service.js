const fetch = require('node-fetch');

const sharedRepository = require('../shared/SharedRepository');

const config = require('../../config');

const repository = new sharedRepository('karaoke', 'karaoke_id');

const service = {
	// Calls youtube API to get search results
	async getYoutube(search) {
		const youtubeSearchUrl =
			'https://youtube.googleapis.com/youtube/v3/search?type=video&maxResults=20&q=karaoke ';

		https: try {
			const searchResponse = await fetch(
				`${youtubeSearchUrl}${search}&key=${config.GOOGLE_API_KEY}`
			);

			const searchData = await searchResponse.json();

			const idList = searchData.items.map((item) => item.id.videoId).join(',');

			const youtubeVideoUrl =
				'https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet';

			const videoResponse = await fetch(
				`${youtubeVideoUrl}&id=${idList}&key=${config.GOOGLE_API_KEY}`
			);

			const videoData = await videoResponse.json();

			const result = videoData.items.map((res) => {
				res.link = `https://www.youtube.com/watch?v=${res.id.videoId}`;
				return {
					id: res.id,
					link: `https://www.youtube.com/watch?v=${res.id}`,
					thumbnail: res.snippet.thumbnail,
					published: res.snippet.publishedAt,
					title: res.snippet.title,
					language: res.snippet.defaultAudioLanguage,
					duration: res.contentDetails.duration,
					views: res.statistics.viewCount,
					likes: res.statistics.likeCount,
					comments: res.statistics.commentCount,
				};
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
