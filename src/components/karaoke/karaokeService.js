const CustomError = require('../../error/CustomError');

const karaokeService = {
	async addKaraokes(karaokes) {
		if (!karaokes || !(karaokes instanceof Array) || karaokes.length === 0)
			throw new CustomError('Invalid input data');

		//console.log(karaokes);
	},
	async addKaraoke(karaoke) {
		console.log(karaoke);
	},
};

module.exports = karaokeService;
