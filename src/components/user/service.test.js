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

//
