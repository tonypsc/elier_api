const service = require('./karaokeService');

describe('addKaraoke', () => {
	test('addKaraoke should throw error on empty list_id', async () => {
		await expect(service.addToList()).rejects.toThrow('Invalid input data');
	});
	test('addToList should throw error on empty karaoke_song_id', async () => {
		await expect(service.addToList('list_id')).rejects.toThrow(
			'Invalid input data'
		);
	});
});
