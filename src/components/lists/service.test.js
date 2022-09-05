const service = require('./service');

describe('create list', () => {
	test('addList should throw error on empty name', async () => {
		await expect(service.addList()).rejects.toThrow('List name is required');
	});
});
