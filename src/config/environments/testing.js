module.exports = {
	SECRET: proccess.env.SECRET,
	SEND_MAILS: false, // activate this in production
	MAIL_HOST: process.env.MAIL_HOST,
	MAIL_PORT: process.env.MAIL_PORT,
	MAIL_USER: process.env.MAIL_USER,
	MAIL_PWD: process.env.MAIL_PWD,
	UPLOADS_FOLDER: 'uploads',
	PAGE_SIZE: 10, // records per page default
	BASE_URL: 'http://api.elier.org/',
	CONFIRMATION_EXPIRES: 72, // hours till confirmation link expires
	CONTACT_EMAIL: 'service@elier.org',
	SITE_URL: 'http://www.elier.org',
};
