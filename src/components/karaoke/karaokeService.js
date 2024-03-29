const CustomError = require('../../error/CustomError');
const SharedRepository = require('../shared/SharedRepository');

const repository = new SharedRepository('karaoke_song', 'karaoke_song_id');

const karaokeService = {
	async addKaraokes(karaokes) {
		if (!karaokes || !(karaokes instanceof Array) || karaokes.length === 0)
			throw new CustomError('Invalid input data');
		if (!karaokes[0].karaoke_song_id || !karaokes[0].title)
			throw new CustomError('Invalid input data');

		return repository.bulkInsert(
			karaokes.map((karaoke) => {
				delete karaoke.similarity;
				return karaoke;
			})
		);
	},
	async addKaraoke(karaoke) {
		console.log(karaoke);
	},
	// Gets the details of the karaoke song
	async getOne(id) {
		if (!id) throw new CustomError('Invalid id');
		const karaoke = await repository.getById(id.toString());
		if (!karaoke) throw new CustomError('Karaoke not found');
		return karaoke;
	},
};

module.exports = karaokeService;
