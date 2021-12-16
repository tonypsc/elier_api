const config = require('../config');
const fetch = require('node-fetch').default;

const captcha = {
	verify(captcha, remoteip) {
		const verifyUrl = `https://google.com/recaptcha/api/verify?secret=${config.CAPTCHA_SECRET}&response=${captcha}&remoteip=${remoteip}`;

		fetch(verifyUrl)
			.then((res) => res.json())
			.then((data) => {
				if (!data || !data.success)
					return { status: 'error', message: 'Captcha failed' };

				return { status: 'success' };
			})
			.catch((err) => {
				if (!res) return { status: 'error', message: 'Captcha failed' };
			});
	},
};

module.exports = captcha;
