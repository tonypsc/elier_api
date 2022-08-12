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

// updateProfile

test('updateProfile, empty user_id, should throw', async () => {
	await expect(service.updateProfile()).rejects.toThrow('Wrong user_id');
});

test('updateProfile, user_id differs authUserId, should throw', async () => {
	await expect(
		service.updateProfile('ssss', 'dd', 'dd', 'ss', 'ddd', '---')
	).rejects.toThrow('Permision denied');
});

test('updateProfile, empty username, should throw', async () => {
	await expect(
		service.updateProfile('user1', null, 'dd', 'ss', 'ddd', 'EN', 'user1')
	).rejects.toThrow('User name (2-40 chars)');
});

test('updateProfile, username to long, should throw', async () => {
	const testString = 'b'.repeat(200);
	await expect(
		service.updateProfile('user1', testString, 'dd', 'ss', 'ddd', 'EN', 'user1')
	).rejects.toThrow('User name (2-40 chars)');
});

test('updateProfile, fullname to long, should throw', async () => {
	const testString = 'b'.repeat(81);
	await expect(
		service.updateProfile(
			'user1',
			'sss',
			testString,
			'ss',
			'ddd',
			'EN',
			'user1'
		)
	).rejects.toThrow('Full name (2-80 chars)');
});

test('updateProfile, empty email, should throw', async () => {
	await expect(
		service.updateProfile('user1', 'dd', 'ss', null, 'ddd', 'EN', 'user1')
	).rejects.toThrow('Invalid email address');
});

test('updateProfile, wrong email, should throw', async () => {
	await expect(
		service.updateProfile('user1', 'dd', 'ss', 'ddd', 'ddd', 'EN', 'user1')
	).rejects.toThrow('Invalid email address');
});

test('updateProfile, email too long, should throw', async () => {
	const testString = 'b'.repeat(200);
	await expect(
		service.updateProfile(
			'user1',
			'dd',
			'ss',
			testString + '@gg.com',
			'ddd',
			'EN',
			'user1'
		)
	).rejects.toThrow('Invalid email address');
});

test('updateProfile, photo to long, should throw', async () => {
	const testString = 'b'.repeat(81);
	await expect(
		service.updateProfile('user1', 'sss', 'dd', 'ss', testString, 'EN', 'user1')
	).rejects.toThrow('Photo name (3-80 chars)');
});

test('updateProfile, user not found, should throw', async () => {
	await expect(
		service.updateProfile(
			'user1',
			'sss',
			'ddd',
			'testString@ss.com',
			'foto',
			'EN',
			'user1'
		)
	).rejects.toThrow('Unexpected errors occurred');
});

test('updateProfile, success, returns user', async () => {
	await expect(
		service.updateProfile(
			'ksyp48ym202ec1a8bbc62a5979d44b2c',
			'wed',
			'profile',
			'teststring@ss.com',
			'foto',
			'EN',
			'ksyp48ym202ec1a8bbc62a5979d44b2c'
		)
	).resolves.toHaveProperty('username');
});

describe('updateLanguage', () => {
	test('should_return_wrong_user_id_for_undefined_passed', async () => {
		await expect(service.updateLanguage()).rejects.toThrow('Wrong user_id');
	});

	test('should_return_wrong_language_for_undefined_passed', async () => {
		await expect(service.updateLanguage('--')).rejects.toThrow(
			'Wrong language'
		);
	});

	test('should_return_wrong_language_for_language_not_defined', async () => {
		await expect(service.updateLanguage('other')).rejects.toThrow(
			'Wrong language'
		);
	});

	test('should_return_es_for_es', async () => {
		await expect(
			service.updateLanguage('ksypvhgb008d4792fbe0d70112c46e63', 'EN')
		).resolves.toBe('EN');
	});
});
