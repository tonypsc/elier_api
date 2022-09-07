const service = require('./service');

// add

test('add, empty email', async () => {
	await expect(service.add()).rejects.toThrow('Wrong email address');
});

test('add, empty name', async () => {
	await expect(service.add('ppp@ff.com')).rejects.toThrow(
		'Name (1 - 80 chars)'
	);
});

test('add, to long phone', async () => {
	const testString = '5'.repeat(41);
	await expect(service.add('ppp@ff.com', 'dd', testString)).rejects.toThrow(
		'Phone (0 - 40 chars)'
	);
});

test('add, empty message', async () => {
	await expect(service.add('ppp@ff.com', 'dd')).rejects.toThrow(
		'Wrong message'
	);
});

test('add, success', async () => {
	await expect(
		service.add('pppw@ff.com', 'ddd', 'erer', 'algunwo', 'captcha')
	).resolves.toHaveProperty('email');
});

// get
test('get, success', async () => {
	await expect(service.get('pppw@ff.com')).resolves.toHaveProperty('total');
});
