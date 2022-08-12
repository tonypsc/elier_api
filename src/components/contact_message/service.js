const SharedRepository = require('../shared/SharedRepository');
const CustomError = require('../../error/CustomError');
const mailer = require('../../services/mailer');
const config = require('../../config');
const ContactMessage = require('./model');
const captchaService = require('../../services/captcha');

const repository = new SharedRepository('contact_message', 'message_id');

const service = {
	/**
	 * Sends the email and inserts a row in contact_message table
	 * @param {string} email
	 * @param {string} name
	 * @param {string} phone
	 * @param {string} message
	 * @param {string} captcha
	 * @param {string} remoteip
	 * @returns {promise}
	 */
	async add(email, name, phone, message, captcha, remoteip) {
		if (
			!email ||
			//eslint-disable-next-line
			!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) ||
			email.length > 255
		)
			// validate
			throw new CustomError('Wrong email address (5 - 255 chars)');

		if (!name || name.length > 80) throw new CustomError('Name (1 - 80 chars)');
		if (phone && phone.length > 40)
			throw new CustomError('Phone (0 - 40 chars)');
		if (!message) throw new CustomError('Wrong message');

		// check captcha
		const captchaResult = await captchaService.verify(captcha, remoteip);
		if (!captchaResult) throw new CustomError('Captcha failed');

		// send email
		await mailer.sendMail(
			config.CONTACT_EMAIL,
			'elier.org, New contact message',
			`Name: ${name}<br>Email: ${email}<br>Phone: ${phone}<br>Created:${new Date().toString()}<br><br>Message: ${message}<br>`
		);

		// persist record
		const message_id = repository.getUUID();

		const newMessage = {
			message_id,
			email: email.toString(),
			name: name.toString(),
			phone: phone ? phone.toString() : null,
			message: message.toString(),
			created_on: new Date().getTime(),
		};

		const result = await repository.insert(newMessage);

		if (!result || result.affectedRows !== 1)
			throw new CustomError('Unexpected errors ocurred');

		return repository.getById(message_id);
	},

	/**
	 * Returns an object with the count of messages and a page of records
	 * @param {string} search
	 * @param {number} page
	 * @param {number} limit
	 * @returns {object}
	 */
	async get(search, page, limit) {
		let fullSearch = '';
		let searchValues = [];

		if (search) {
			search = `%${search}%`;
			fullSearch =
				'name LIKE ? OR email LIKE ? OR message LIKE ? OR phone LIKE ? ';
			searchValues = new Array(4).fill(search);
		}

		const total = await repository.countEx(fullSearch, searchValues);

		const messages = await repository.getEx(
			fullSearch,
			searchValues,
			page,
			limit
		);

		return { total, messages };
	},
};

module.exports = service;
