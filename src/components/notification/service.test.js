const service = require('./service');

// getAll

test('getAll, empty user_id', async () => {
	await expect(service.getAll()).rejects.toThrow('Wrong user_id');
});

test('getAll, wrong type user_id', async () => {
	await expect(service.getAll([3, 4])).resolves.toMatchObject([]);
});

test('getAll, user does not exist', async () => {
	await expect(service.getAll('---')).resolves.toMatchObject([]);
});

// add
test('add, empty user_id', async () => {
	await expect(service.add()).rejects.toThrow('Wrong user_id');
});

test('add, user_id larger than 32', async () => {
	await expect(
		service.add('123456789012345678901234567890123')
	).rejects.toThrow('Wrong user_id');
});

test('add, empty title', async () => {
	await expect(service.add()).rejects.toThrow('Title (1-150 chars)');
});

test('add, title larger than 150', async () => {
	const testStr = 'b'.repeat(151);
	await expect(service.add('user', testStr)).rejects.toThrow(
		'Title (1-150 chars)'
	);
});

test('add, empty notification', async () => {
	await expect(service.add()).rejects.toThrow('Notification (1-255 chars)');
});

test('add, notification larger than 255', async () => {
	const testStr = 'b'.repeat(256);
	await expect(service.add('user', 'title', testStr)).rejects.toThrow(
		'Notification (1-255 chars)'
	);
});

test('add, url larger than 255', async () => {
	const testStr = 'b'.repeat(256);
	await expect(service.add('user', 'title', 'notif', testStr)).rejects.toThrow(
		'Url (1-255 chars)'
	);
});

test('add, user does not exists', async () => {
	await expect(service.add('user', 'title', 'notif', 'ddddd')).rejects.toThrow(
		'foreign key constraint fails'
	);
});

test('add, success', async () => {
	await expect(
		service.add(
			'ksypvhgb008d4792fbe0d70112c46e63',
			'first one',
			'check something',
			'url to go'
		)
	).resolves.toHaveProperty('title');
});

// markread

test('markread, empty notification_id', async () => {
	await expect(service.markRead()).rejects.toThrow('Wrong notification_id');
});

test('markread, notification_id does not exists', async () => {
	await expect(service.markRead('sssssssssss')).rejects.toThrow(
		'No data changed'
	);
});

test('markread, success', async () => {
	await expect(
		service.markRead('kt8u1fcf09f7fcb82911380e976e71a9')
	).resolves.toBe(true);
});

// markAllUser

test('markAllUser, empty user_id', async () => {
	await expect(service.markAllUser()).rejects.toThrow('Wrong user_id');
});

test('markAllUser, user does not exists', async () => {
	await expect(service.markAllUser('fcb82911380e976e71a9')).rejects.toThrow(
		'No data changed'
	);
});

test('markAllUser, success', async () => {
	await expect(
		service.markAllUser('ksypvhgb008d4792fbe0d70112c46e63')
	).resolves.toBe(true);
});
