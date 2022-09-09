module.exports = {
	SECRET: process.env.SECRET,
	SEND_MAILS: false,
	MAIL_HOST: process.env.MAIL_HOST,
	MAIL_PORT: process.env.MAIL_PORT,
	MAIL_USER: process.env.MAIL_USER,
	MAIL_PWD: process.env.MAIL_PWD,
	UPLOADS_FOLDER: 'uploads',
	PAGE_SIZE: 10, // records per page default
	BASE_URL: 'http://api.elier.org/',
	CONFIRMATION_EXPIRES: 72, // hours till confirmation link expires
	CONTACT_EMAIL: 'service@elier.org, elierorg@gmail.com',
	SITE_URL: 'http://www.elier.org',
	DB_HOST: process.env.DB_HOST,
	DB_USER: process.env.DB_USER,
	DB_PASS: process.env.DB_PASS,
	DB_NAME: process.env.DB_NAME,
	CAPTCHA_SECRET: process.env.CAPTCHA_SECRET,
	GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
};
