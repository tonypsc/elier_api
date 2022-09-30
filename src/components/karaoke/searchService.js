const fetch = require('node-fetch');
const stringSimilarity = require('string-similarity');

const config = require('../../config');

const searchService = {
	// Calls youtube API to get search results
	async getYoutube(search = '', page = 1) {
		let youtubeSearchUrl =
			'https://youtube.googleapis.com/youtube/v3/search?type=video&maxResults=20';

		if (page !== 1) youtubeSearchUrl += '&pageToken=CBQQAA';

		youtubeSearchUrl += '&q="karaoke" ';

		if (search) youtubeSearchUrl += ` ${search}`;

		youtubeSearchUrl += `&key=${config.GOOGLE_API_KEY}`;

		try {
			const searchResponse = await fetch(youtubeSearchUrl);

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
	async getDailyMotion(search = '', page = 1) {
		const dailyMotioneUrl = `https://api.dailymotion.com/videos?shorter_than=10&limit=20&page=${page}&fields=id,title,thumbnail_120_url,thumbnail_360_url,thumbnail_480_url,language,duration,views_total,likes_total&search="karaoke" `;

		try {
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
	async getAll(search, page) {
		if (!search) return [];

		const youtubeResults = await this.getYoutube(search, page);
		const dailyMotionResults = await this.getDailyMotion(search);
		const results = [...youtubeResults, ...dailyMotionResults];

		return results.sort((a, b) => a.similarity - b.similarity);
	},

	// Converts duration from youtube format to seconds
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

module.exports = searchService;