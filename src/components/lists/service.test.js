const service = require('./service');

describe('add', () => {
	test('add should throw error missing user_id', async () => {
		await expect(service.add()).rejects.toThrow('Invalid input data');
	});

	test('add should throw error missing app_id', async () => {
		await expect(service.add('user_id')).rejects.toThrow('Invalid input data');
	});

	test('add should throw error on empty name', async () => {
		await expect(service.add('user_id', 'app_id')).rejects.toThrow(
			'List name is required'
		);
	});

	test('add should throw error on only spaces on name', async () => {
		await expect(service.add('user_id', 'app_id', '  ')).rejects.toThrow(
			'List name is required'
		);
	});

	test('add should throw error on more than 100 chars name', async () => {
		const longName = new Array(101).fill('f');
		await expect(service.add('user_id', 'app_id', longName)).rejects.toThrow(
			'List name too long (100 max)'
		);
	});
});

describe('getAll', () => {
	test('getAll should throw error on empty user_id or app_id', async () => {
		await expect(service.getAll()).rejects.toThrow('Invalid input data');
	});

	test('getAll should return array on success', async () => {
		const result = await service.getAll('adfasdf', 'karaoke');
		expect(result instanceof Array).toBeTruthy();
	});
});

describe('update', () => {
	test('getAll should throw error on empty user_id or app_id', async () => {
		await expect(service.getAll()).rejects.toThrow('Invalid input data');
	});
});
