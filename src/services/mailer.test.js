const mailer = require('./mailer');

describe('sendmail', () => {
	test('should throw "Mail receiver is required" if "to" empty', async () => {
		await expect(mailer.sendMail()).rejects.toThrow(
			'Mail receiver is required'
		);
	});
});
