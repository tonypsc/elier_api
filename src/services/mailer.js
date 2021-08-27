const nodemailer = require('nodemailer');
const config = require('../config/default');

// async..await is not allowed in global scope, must use a wrapper

const mailer = {
	async sendMail(to, subject, text) {
		const transporter = nodemailer.createTransport({
			host: config.MAIL_HOST,
			port: config.MAIL_PORT,
			auth: {
				user: config.MAIL_USER,
				pass: config.MAIL_PWD,
			},
			proxy: 'http://felix.perez:Unpetmcpep87*@proxy.rabi.azcuba.cu:3128/',
		});

		const mailOptions = {
			from: config.MAIL_USER,
			to: to,
			subject: subject,
			html: text,
		};

		// send mail with defined transport object
		const info = await transporter.sendMail(mailOptions);

		console.log('Message sent: %s', info.messageId);
		// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

		// Preview only available when sending through an Ethereal account
		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
		// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
	},
};

module.exports = mailer;
