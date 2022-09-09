const service = require('./service');

describe('addToList', () => {
	test('addToList should throw error if list_id is empty', async () => {
		expect(service.addToList().rejects.toThrow('Invalid input data'));
	});
	test('addToList should throw error if karaoke_song_id is empty', async () => {
		expect(service.addToList('list_id').rejects.toThrow('Invalid input data'));
	});
});
