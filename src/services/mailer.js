const nodemailer = require('nodemailer');
const config = require('../config');
const CustomError = require('../error/CustomError');

const mailer = {
	async sendMail(to, subject = '', text = '') {
		if (!to) throw new CustomError('Mail receiver is required.');

		// if mails are active
		if (!config.SEND_MAILS) return true;

		const transporter = nodemailer.createTransport({
			host: config.MAIL_HOST,
			port: config.MAIL_PORT,
			auth: {
				user: config.MAIL_USER,
				pass: config.MAIL_PWD,
			},
		});

		const mailOptions = {
			from: config.MAIL_USER,
			to: to,
			subject: subject,
			html: text,
		};

		try {
			// send mail with defined transport object
			await transporter.sendMail(mailOptions);
			return true;
		} catch (error) {
			throw new CustomError('Mail system error. ' + error.message);
		}

		// const info = await transporter.sendMail(mailOptions);

		//console.log('Message sent: %s', info.messageId);
		// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

		// Preview only available when sending through an Ethereal account
		//console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
		// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
	},
};

module.exports = mailer;
