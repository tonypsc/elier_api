const nodemailer = require('nodemailer');
const config = require('../config/default');
const constants = require('../constants/index');

// async..await is not allowed in global scope, must use a wrapper

const mailer = {
	async sendMail(to, subject, text) {
		// prevents sending mails in development environment
		//if (process.env.NODE_ENV === 'development') return true;

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
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Mail system error. ' + error.message,
			};
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
