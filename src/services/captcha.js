const config = require('../config');
const fetch = require('node-fetch').default;
const CustomError = require('../error/CustomError');

const captcha = {
	async verify(captcha, remoteip) {
		// skipping captcha for testing or development
		if (config.env === 'testing' || config.env === 'development') return true;
		if (!captcha) throw new CustomError('captcha empty');

		const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${config.CAPTCHA_SECRET}&response=${captcha}&remoteip=${remoteip}`;

		try {
			const res = await fetch(verifyUrl);
			const data = await res.json();

			if (!data || !data.success) return false;

			return true;
		} catch (err) {
			console.log(err);
			return false;
		}
	},
};

module.exports = captcha;
