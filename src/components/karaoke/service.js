const fetch = require('node-fetch');
const stringSimilarity = require('string-similarity');

const sharedRepository = require('../shared/SharedRepository');
const config = require('../../config');

const repository = new sharedRepository('karaoke', 'karaoke_id');

const service = {
	// Calls youtube API to get search results
	async getYoutube(search) {
		const youtubeSearchUrl =
			'https://youtube.googleapis.com/youtube/v3/search?type=video&maxResults=20&q="karaoke"';

		https: try {
			const searchResponse = await fetch(
				search
					? `${youtubeSearchUrl} ${search}&key=${config.GOOGLE_API_KEY}`
					: `${youtubeSearchUrl}&key=${config.GOOGLE_API_KEY}`
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
				return {
					id: res.id,
					link: `https://www.youtube.com/watch?v=${res.id}`,
					thumbnail: {
						small: res.snippet.thumbnails.default.url,
						medium: res.snippet.thumbnails.medium.url,
						high: res.snippet.thumbnails.high.url,
					},
					published: res.snippet.publishedAt,
					title: res.snippet.title,
					language: res.snippet.defaultAudioLanguage,
					duration: this.youtubeDurationToSeconds(res.contentDetails.duration),
					views: parseInt(res.statistics.viewCount),
					likes: parseInt(res.statistics.likeCount),
					comments: parseInt(res.statistics.commentCount),
					origin: 'youtube',
					similarity: stringSimilarity.compareTwoStrings(
						res.snippet.title.toLowerCase(),
						`karaoke ${search.toLowerCase()}`
					),
				};
			});

			return result;
		} catch (err) {
			console.log(err);
			return [];
		}
	},

	// Calls dailyMotion API to get search results
	async getDailyMotion(search) {
		const dailyMotioneUrl =
			'https://api.dailymotion.com/videos?shorter_than=10&fields=id,title,thumbnail_120_url,thumbnail_360_url,thumbnail_480_url,language,duration,views_total,likes_total&search="karaoke" ';

		https: try {
			const res = await fetch(
				search ? `${dailyMotioneUrl}${search}` : dailyMotioneUrl
			);
			const data = await res.json();

			const result = data.list.map((res) => {
				return {
					id: res.id,
					link: `https://www.dailymotion.com/video${res.id}`,
					thumbnail: {
						small: res.thumbnail_120_url,
						medium: res.thumbnail_360_url,
						high: res.thumbnail_480_url,
					},
					published: undefined,
					title: res.title,
					language: res.language,
					duration: res.duration,
					views: res.views_total,
					likes: res.likes_total,
					comments: 0,
					origin: 'dailymotion',
					similarity: stringSimilarity.compareTwoStrings(
						res.title.toLowerCase(),
						`karaoke ${search.toLowerCase()}`
					),
				};
			});

			return result;
		} catch (err) {
			console.log(err);
			return [];
		}
	},
	async getAll(search) {
		const youtubeResults = await this.getYoutube(search);
		const dailyMotionResults = await this.getDailyMotion(search);
		const results = [...youtubeResults, ...dailyMotionResults];

		return results.sort((a, b) => a.similarity - b.similarity);
	},
	youtubeDurationToSeconds(duration) {
		const match = duration.match(
			/P(\d+Y)?(\d+W)?(\d+D)?T(\d+H)?(\d+M)?(\d+S)?/
		);

		// An invalid case won't crash the app.
		if (!match) {
			console.error(`Invalid YouTube video duration: ${duration}`);
			return 0;
		}
		const [years, weeks, days, hours, minutes, seconds] = match
			.slice(1)
			.map((_) => (_ ? parseInt(_.replace(/\D/, '')) : 0));
		return (
			(((years * 365 + weeks * 7 + days) * 24 + hours) * 60 + minutes) * 60 +
			seconds
		);
	},
};

module.exports = service;
