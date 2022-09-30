const service = require('./karaokeService');

describe('addKaraokes', () => {
	test('addKaraoke should throw error on undefined input', async () => {
		await expect(service.addKaraokes()).rejects.toThrow('Invalid input data');
	});
	test('addKaraoke should throw error on empty array', async () => {
		await expect(service.addKaraokes([])).rejects.toThrow('Invalid input data');
	});
	test('addKaraoke should throw error on not array', async () => {
		await expect(service.addKaraokes('jhon')).rejects.toThrow(
			'Invalid input data'
		);
	});
});
