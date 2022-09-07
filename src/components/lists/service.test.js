const service = require('./service');

describe('create list', () => {
	test('addList should throw error missing user_id', async () => {
		await expect(service.addList()).rejects.toThrow('Invalid input data');
	});

	test('addList should throw error missing app_id', async () => {
		await expect(service.addList('user_id')).rejects.toThrow(
			'Invalid input data'
		);
	});

	test('addList should throw error on empty name', async () => {
		await expect(service.addList('user_id', 'app_id')).rejects.toThrow(
			'List name is required'
		);
	});

	test('addList should throw error on only spaces on name', async () => {
		await expect(service.addList('user_id', 'app_id', '  ')).rejects.toThrow(
			'List name is required'
		);
	});

	test('addList should throw error on more than 100 chars name', async () => {
		const longName = new Array(101).fill('f');
		await expect(
			service.addList('user_id', 'app_id', longName)
		).rejects.toThrow('List name too long (100 max)');
	});
});
