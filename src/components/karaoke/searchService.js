const fetch = require('node-fetch');
const stringSimilarity = require('string-similarity');

const config = require('../../config');

const karaokeService = require('./karaokeService');

const DEFAULT_ASPECT_RATIO = 1.7777777777777777;

const searchService = {
	// Calls youtube API to get search results
	async getYoutube(search = '', page = '1', nextPageToken = 'CGQQAA', perPage) {
		let youtubeSearchUrl =
			'https://youtube.googleapis.com/youtube/v3/search?type=video&maxResults=' +
			perPage;

		if (page !== '1' && nextPageToken)
			youtubeSearchUrl += '&pageToken=' + nextPageToken;

		youtubeSearchUrl += '&q="karaoke" ';

		if (search) youtubeSearchUrl += ` ${search}`;

		youtubeSearchUrl += `&key=${config.GOOGLE_API_KEY}`;

		try {
			const searchResponse = await fetch(youtubeSearchUrl);

			const searchData = await searchResponse.json();

			const idList = searchData.items.map((item) => item.id.videoId).join(',');
			const nextPageToken = searchData.nextPageToken;

			const youtubeVideoUrl =
				'https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet,player';

			const videoResponse = await fetch(
				`${youtubeVideoUrl}&id=${idList}&key=${config.GOOGLE_API_KEY}`
			);

			// Get video data details
			const videoData = await videoResponse.json();

			const result = videoData.items.map((res) => {
				return {
					karaoke_song_id: res.id,
					origin: 'youtube',
					link: `https://www.youtube.com/watch?v=${res.id}`,
					title: res.snippet.title,
					language: res.snippet.defaultAudioLanguage || 'en',
					duration: this.youtubeDurationToSeconds(res.contentDetails.duration),
					views: parseInt(res.statistics.viewCount),
					likes: parseInt(res.statistics.likeCount),
					comments: parseInt(res.statistics.commentCount),
					thumbnail_small: res.snippet.thumbnails.default.url,
					thumbnail_medium: res.snippet.thumbnails.medium.url,
					thumbnail_high: res.snippet.thumbnails.high.url,
					definition: res.contentDetails.definition,
					aspect_ratio: this.getYoutubeAspectRatio(res.player.embedHtml),
					licensedContent: res.contentDetails.licensedContent,
					//published: res.snippet.publishedAt,
					similarity: stringSimilarity.compareTwoStrings(
						res.snippet.title.toLowerCase(),
						`karaoke ${search.toLowerCase()}`
					),
				};
			});

			return { nextPageToken, videoList: result ?? [] };
		} catch (err) {
			console.log(err);
			return { nextPageToken: 'error', videoList: [] };
		}
	},

	// Calls dailyMotion API to get search results
	async getDailyMotion(search = '', page = 1, perPage) {
		const dailyMotioneUrl = `https://api.dailymotion.com/videos?shorter_than=10&limit=${perPage}&page=${page}&fields=id,title,thumbnail_120_url,thumbnail_360_url,thumbnail_480_url,language,duration,views_total,likes_total,private,available_formats&search="karaoke" `;

		try {
			const res = await fetch(
				search ? `${dailyMotioneUrl}${search}` : dailyMotioneUrl
			);
			const data = await res.json();

			const result = data.list.map((res) => {
				return {
					karaoke_song_id: res.id,
					origin: 'dailymotion',
					link: `https://www.dailymotion.com/video/${res.id}`,
					title: res.title,
					language: res.language || 'en',
					duration: res.duration,
					views: res.views_total,
					likes: res.likes_total,
					comments: 0,
					thumbnail_small: res.thumbnail_120_url,
					thumbnail_medium: res.thumbnail_360_url,
					thumbnail_high: res.thumbnail_480_url,
					definition: res.available_formats[res.available_formats.length - 1],
					aspect_ratio: res.aspect_ratio ?? DEFAULT_ASPECT_RATIO,
					licensedContent: res.private,
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

	// Sums, sorts and add results to db
	async getAll(search, page, nextPageToken, perPage = 20) {
		if (!search) return [];

		const youtubeResults = await this.getYoutube(
			search,
			page,
			nextPageToken,
			perPage
		);
		const dailyMotionResults = await this.getDailyMotion(search, page, perPage);
		const results = [...youtubeResults.videoList, ...dailyMotionResults];

		karaokeService.addKaraokes(results).catch((err) => console.log(err));

		return {
			nextPageToken: youtubeResults.nextPageToken,
			videos: results.sort((a, b) => a.similarity - b.similarity),
		};
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

	getYoutubeAspectRatio(embedHtml) {
		if (!embedHtml) return DEFAULT_ASPECT_RATIO;

		const propArray = embedHtml.split(' ');

		const width =
			propArray
				.find((item) => item.includes('width='))
				.split('=')[1]
				.replace(/"/g, '') ?? 480;

		const height =
			propArray
				.find((item) => item.includes('height='))
				.split('=')[1]
				.replace(/"/g, '') ?? 270;

		const result = width / height;

		return result || DEFAULT_ASPECT_RATIO;
	},
};

module.exports = searchService;
