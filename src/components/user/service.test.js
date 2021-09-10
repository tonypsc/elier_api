const service = require('./service');
const constants = require('../../constants/index');

// LOGIN

test('login, empty username or password', async () => {
	await expect(service.login()).rejects.toThrow('Wrong input data');
});

test('login, user not in db', async () => {
	await expect(service.login('---', '---')).rejects.toThrow('User not found');
});

test('login, user account disabled', async () => {
	await expect(service.login('wed', 'ddd')).rejects.toThrow(
		'User account disabled'
	);
});

test('login, user exists but password incorrect', async () => {
	await expect(service.login('tony', 'ddd')).rejects.toThrow(
		'Wrong credentials'
	);
});

test('login, successfull', async () => {
	await expect(service.login('pepe224', 'ed')).resolves.toHaveProperty(
		'username'
	);
});

// recover

test('recover, empty email', async () => {
	await expect(service.recover()).rejects.toThrow('Email address is required');
});

test('recover, email does not exists', async () => {
	await expect(service.recover('aaaaaa')).rejects.toThrow(
		'Wrong email address'
	);
});

// verifyLink

test('verifyLink, empty link', async () => {
	await expect(service.verifyLink()).rejects.toThrow('Wrong link');
});

test('verifyLink, link does not exists', async () => {
	await expect(service.verifyLink('sdsdf')).rejects.toThrow('Wrong link');
});

test('verifyLink, link expired', async () => {
	await expect(
		service.verifyLink(
			'd8f82e1348272132755666077319cbd41140beb238b6449d5e3e2164d9349587'
		)
	).rejects.toThrow('Link expired');
});

// test('verifyLink, success', async () => {
// 	await expect(
// 		service.verifyLink(
// 			'2edc809ab3c0a53524abe947f882a2661d4947e4c035c1d7818325b766c7e245'
// 		)
// 	).resolves.toHaveProperty('username');
// });

// resetpwd

// exists

test('exists, empty user name, should return error', async () => {
	await expect(service.exists()).rejects.toThrow('Wrong username');
});

test('exists, unexisting username, should return false', async () => {
	await expect(service.exists('----')).resolves.toBe(false);
});

test('exists, existing username, should return true', async () => {
	await expect(service.exists('tony')).resolves.toBe(true);
});
