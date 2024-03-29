const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const SharedRepository = require('../shared/SharedRepository');
const dto = require('./dto');
const mailer = require('../../services/mailer');
const config = require('../../config');
const CustomError = require('../../error/CustomError');
const language = require('../../language/lang');
const captchaService = require('../../services/captcha');

const uiFields = [
	'user_id',
	'userName',
	'fullName',
	'email',
	'photo',
	'status',
	'role_id',
	'theme',
	'logged_in',
	'language',
];

const UNCONFIRMED = 3,
	ACTIVE = 1,
	INACTIVE = 0;

const repository = new SharedRepository('user', 'user_id');

const userService = {
	/**
	 * Checks if user exists, is active and has proper credentials
	 * @param {*} userName
	 * @param {*} password
	 * @returns {object} user data
	 */
	async login(userName, password, captcha, remoteip) {
		if (!userName || !password) throw new CustomError('Wrong input data');

		// check captcha
		const captchaResult = await captchaService.verify(captcha, remoteip);
		if (!captchaResult) throw new CustomError('Captcha failed');

		const user = await repository.getOne({ username: userName });

		// user does not exists
		if (!user) throw new CustomError('User not found');

		// user inactive
		if (user.status === INACTIVE)
			throw new CustomError('User account disabled');

		// registration unconfirmed
		if (user.status === UNCONFIRMED)
			throw new CustomError('Confirmation pendding');

		// other status different from active (banned, prohibited, etc)
		if (user.status !== ACTIVE)
			throw new CustomError('User account not active');

		// check password
		if (
			!bcrypt.compareSync(password, user.pass)
			// &&	!bcrypt.compareSync(password, saUser.password)
		)
			throw new CustomError('Wrong credentials');

		// success login
		return dto.single(user);
	},

	/**
	 * Sends the recovery link to email and stores link data for user
	 * @param {string} emailAddress
	 * @returns {promise}
	 */
	async recover(emailAddress, lang = 'EN', captcha, remoteip) {
		//Check email exists
		if (!emailAddress) throw new CustomError('Email address is required');

		// check captcha
		const captchaResult = await captchaService.verify(captcha, remoteip);
		if (!captchaResult) throw new CustomError('Captcha failed');

		const user = await repository.getOne({ email: emailAddress });

		if (!user) throw new CustomError('Wrong email address');

		// Create recover link
		const link = crypto.randomBytes(32).toString('hex');
		const newUser = {
			...user,
			recover_link: link,
			link_created_on: Date.now(),
		};

		await repository.update(user.user_id, newUser);

		// send the email
		return mailer.sendMail(
			emailAddress,
			`elier.org, ${language.translate(lang, 'recoverSubject')}`,
			`${language.translate(lang, 'recoverText')}<br/>
						${language.translate(lang, 'recoverExpireText')}<br/>
						<a href="${config.SITE_URL}/${lang}/recoverpwd/${link}">${language.translate(
				lang,
				'recoverLink'
			)}</a>`
		);
	},

	/**
	 * Returns the user with the link,
	 * raises an error if user not found or link expired
	 * @param {string} link
	 * @returns {object}
	 */
	async verifyLink(link) {
		if (!link) throw new CustomError('Wrong link');

		// Verify link
		const user = await repository.getOne({ recover_link: link });

		if (!user) throw new CustomError('Wrong link');

		// Verify link is active (24h)
		const linkCreated = user.link_created_on ? user.link_created_on : 0;
		const hours = (Date.now() - linkCreated) / 1000 / 60 / 60;

		if (hours > 24) throw new CustomError('Link expired');

		return user;
	},

	/**
	 * Resets the password, via recover
	 * @param {string} link
	 * @param {string} password
	 * @param {string} confirm
	 * @returns
	 */
	async resetPwd(link, password, confirm) {
		if (!link || !password || !confirm)
			throw new CustomError('Wrong input data');

		if (!link) throw new CustomError('Wrong link');

		// Check link
		const user = await this.verifyLink(link);
		return this.setPwd(user, password, confirm);
	},

	/**
	 * User changes password
	 * @param {string} user_id
	 * @param {string} oldPwd
	 * @param {string} newPwd
	 * @param {string} confirm
	 * @returns {object} user data
	 */
	async changePwd(user_id, oldPwd, newPwd, confirm) {
		if (!user_id || !oldPwd || !newPwd || !confirm)
			throw new CustomError('Incorrect input data');

		// Verify old password
		const user = await repository.getById(user_id);

		if (!user) throw new CustomError('Wrong user');
		if (!oldPwd || !bcrypt.compareSync(oldPwd, user.pass))
			throw new CustomError('Wrong current password');

		return this.setPwd(user, newPwd, confirm);
	},

	/**
	 * Admin set password for user
	 * @param {string} user_id
	 * @param {string} password
	 * @param {string} confirm
	 * @returns {object} user data
	 */
	async newPwd(user_id, password, confirm) {
		const user = await this.getById(user_id);
		return this.setPwd(user, password, confirm);
	},

	/**
	 *	Sets the password
	 * @param {object} user
	 * @param {string} password
	 * @param {string} confirm
	 * @returns {object} user data
	 */
	setPwd(user, password, confirm) {
		if (!user || !password || !confirm)
			throw new CustomError('Incorrect input data');

		if (!user) throw new CustomError('Wrong user');

		if (!password || password.length < 6)
			throw new CustomError('Wrong password (6-64 chars)');

		if (password !== confirm)
			throw new CustomError('New password and confirmation don`t match');

		// Crypt pwd
		const salt = bcrypt.genSaltSync(10);
		const hashedPwd = bcrypt.hashSync(password, salt);
		const newUser = { ...user, pass: hashedPwd };

		// Update user
		return repository.update(user.user_id, newUser);
	},

	/**
	 * Inserts the row in user and sends the confirmation email with the link
	 * @param {string} fullname
	 * @param {string} email
	 * @param {string} password
	 * @param {string} confirm
	 * @returns
	 */
	async register(fullname, email, pass, confirm, lang, captcha, remoteip) {
		lang = lang || 'EN';

		// check captcha
		const captchaResult = await captchaService.verify(captcha, remoteip);
		if (!captchaResult) throw new CustomError('Captcha failed');

		let user = {
			username: email,
			fullname: fullname || email,
			pass,
			confirm,
			email,
			language: lang,
		};

		// validate fields
		const validationResult = this.validate(user, true);

		if (validationResult !== true) throw new CustomError(validationResult);

		// encrypt password
		const salt = bcrypt.genSaltSync(10);
		const hashedPwd = bcrypt.hashSync(pass, salt);
		const user_id = repository.getUUID();
		const confirmation_link = crypto.randomBytes(32).toString('hex');

		// insert user
		user = {
			...user,
			user_id,
			pass: hashedPwd,
			role_id: 'user',
			created_on: new Date().getTime(),
			status: UNCONFIRMED,
			confirmation_link,
		};

		delete user.confirm;

		await repository.insert(user);

		await mailer.sendMail(
			email,
			`elier.org, ${language.translate(lang, 'registerSubject')}`,
			`${language.translate(lang, 'registerText')}<br/>
						${language.translate(lang, 'registerExpireText')}<br/>
						<a href="${
							config.SITE_URL
						}/${lang}/confirmregister/${confirmation_link}"><h3>${language.translate(
				lang,
				'registerLink'
			)}</h3></a>`
		);

		return repository.getById(user_id, uiFields);
	},

	/**
	 * Sends the confirmation link to user
	 * @param {string} email
	 */
	async sendConfirmationLink(email, lang = 'EN') {
		if (!email) throw new CustomError('Invalid email addresss');

		// get the user
		const user = await repository.getOne({ email });
		if (!user) throw new CustomError('Invalid email addresss');

		if (user.status !== UNCONFIRMED) throw new CustomError('Wrong user status');

		// generate confirmation link
		const confirmation_link = crypto.randomBytes(32).toString('hex');

		// update user confirmation_link and created_on
		user.confirmation_link = confirmation_link;
		user.created_on = new Date().getTime();
		const result = await repository.update(user.user_id, user);

		if (!result || result.affectedRows === 0) {
			throw new CustomError('Unexpected errors occurred');
		}

		// send email
		return mailer.sendMail(
			email,
			`elier.org, ${language.translate(lang, 'confirmRegistrationSubject')}`,
			`${language.translate(lang, 'confirmRegistrationText')}<br/>
			    ${language.translate(lang, 'confirmRegistationExpires')}<br/>
			    <a href="${config.SITE_URL}/${confirmation_link}"><h3>${language.translate(
				lang,
				'confirmRegistationLink'
			)}</h3></a>`
		);
	},

	/**
	 * Marks user status as active
	 * @param {string} link
	 */
	async confirmRegistation(link, lang) {
		if (!link) throw new CustomError('Invalid confirmation link');

		const user = await repository.getOne({ confirmation_link: link });

		if (!user) throw new CustomError('Invalid confirmation link');

		// check expire date
		const time_elapsed =
			(new Date().getTime() - user.created_on) / 1000 / 60 / 60;

		if (config.CONFIRMATION_EXPIRES < time_elapsed)
			throw new CustomError('Confirmation link expired');

		// check status different from unconfirmed(3), may be a hack attempt
		if (user.status != UNCONFIRMED)
			throw new CustomError('Invalid confirmation link');

		// change user status
		user.status = ACTIVE;
		const result = await repository.update(user.user_id, user);

		// if no language specified, use user language
		lang = lang || user.language;

		// send wellcome email
		mailer.sendMail(
			user.email,
			language.translate(lang, 'wellcomeSubject'),
			language.translate(lang, 'wellcomeText')
		);

		if (!result || result.affectedRows === 0) {
			throw new CustomError('Unexpected errors occurred');
		}

		return repository.getById(user.user_id, uiFields);
	},

	/**
	 * Inserts the user row in user table
	 * @param {string} username
	 * @param {string} fullname
	 * @param {string} password
	 * @param {string} password the confirmation of password
	 * @param {string} email
	 * @param {string[]} photo
	 * @param {string} roe_id
	 * @returns {promise} with the inserted object
	 */
	async insert(username, fullname, password, confirm, email, photo, role_id) {
		// validate fields
		const validationResult = this.validate(
			{
				username,
				fullname,
				password,
				confirm,
				email,
			},
			true
		);

		if (validationResult !== true) throw new CustomError(validationResult);

		// encrypt password
		const salt = bcrypt.genSaltSync(10);
		const hashedPwd = bcrypt.hashSync(password, salt);
		const user_id = repository.getUUID();

		// insert user
		const user = {
			user_id,
			username,
			fullname,
			pass: hashedPwd,
			email,
			photo,
			role_id,
			created_on: new Date().getTime(),
		};

		await repository.insert(user);
		return repository.getById(user_id, uiFields);
	},

	/**
	 * Returns the rows from user matching the criteria
	 * @param {string} search
	 * @param {number} page
	 * @param {number} limit
	 * @returns
	 */
	async get(search, page, limit) {
		page = page < 0 ? 0 : page - 1;

		let fullSearch = '';
		let searchValues = [];

		if (search) {
			search = `%${search}%`;
			fullSearch = 'username LIKE ? OR fullname LIKE ? OR email LIKE ?';
			searchValues = new Array(3).fill(search);
		}

		const total = await repository.countEx(fullSearch, searchValues);

		const users = await repository.getEx(
			fullSearch,
			searchValues,
			uiFields,
			'username',
			page,
			limit
		);

		return { total, users };
	},

	/**
	 * Returns the user identified by id
	 * @param {string} user_id
	 * @returns {object}
	 */
	async getById(user_id) {
		if (!user_id) throw new CustomError('Incorrect input data');

		const result = await repository.getById(user_id, uiFields);

		if (!result) throw new CustomError('User not found');

		return result;
	},

	/**
	 * Deletes the user
	 * @param {string} user_id
	 * @returns {promise}
	 */
	async delete(user_id) {
		if (!user_id) throw new CustomError('Incorrect input data');

		const result = await repository.delete(user_id);

		if (!result || result.affectedRows === 0) {
			throw new CustomError('User not found');
		}

		return true;
	},

	/**
	 * Updates user data
	 * @param {string} user_id
	 * @param {string} username
	 * @param {string} fullname
	 * @param {string} email
	 * @param {string} role_id
	 * @param {string} photo
	 * @param {boolean} status
	 * @returns
	 */
	async update(
		user_id,
		username,
		fullname,
		email,
		role_id,
		photo,
		status,
		language,
		authUserRole,
		authUserId
	) {
		if (authUserRole != 'admin' && user_id !== authUserId)
			throw new CustomError('Permision denied');

		const user = {
			username,
			fullname,
			email,
			photo,
			language,
		};

		if (role_id !== undefined) user.role_id = role_id;
		if (status !== undefined) user.status = status;

		// validate fields
		const validationResult = this.validate(user);

		if (validationResult !== true) throw new CustomError(validationResult);

		const result = await repository.update(user_id, user);

		if (!result || result.affectedRows === 0)
			throw new CustomError('Errors occurred or user not found');

		return repository.getById(user_id, uiFields);
	},

	/**
	 * Updates the profile info for the user
	 * @param {string} user_id
	 * @param {string} username
	 * @param {string} fullname
	 * @param {string} email
	 * @param {string} photo
	 * @param {string} authUserId // id of the authenticated user
	 * @returns {object} user new data
	 */
	async updateProfile(
		user_id,
		username,
		fullname,
		email,
		photo,
		language,
		authUserId
	) {
		if (!user_id) throw new CustomError('Wrong user_id');

		if (user_id !== authUserId) throw new CustomError('Permision denied');

		const user = {
			username,
			fullname,
			email,
			photo,
			language,
		};

		// validate
		const validationResult = this.validate(user, false);
		if (validationResult !== true) throw new CustomError(validationResult);

		const result = await repository.update(user_id, user);

		if (!result || result.affectedRows !== 1)
			throw new CustomError('Unexpected errors occurred');

		return { ...user, user_id };
	},

	/**
	 * Updates the photo for the user
	 * @param {string} user_id
	 * @param {string} photo
	 * @param {string} authUserId // id of the authenticated user
	 * @returns {object} user new data
	 */
	async updatePhoto(user_id, photo) {
		if (!user_id) throw new CustomError('Wrong user_id');
		if (!photo) throw new CustomError('Wrong photo');

		const user = { photo };

		const result = await repository.update(user_id, user);

		if (!result || result.affectedRows !== 1)
			throw new CustomError('Unexpected errors occurred');

		return true;
	},

	async updateLanguage(user_id, lang) {
		if (!user_id) throw new CustomError('Wrong user_id');
		if (!lang) throw new CustomError('Wrong language');
		if (!language.definedLangs.includes(lang.toUpperCase()))
			throw new CustomError('Language not defined');

		const user = { language: lang };

		const result = await repository.update(user_id, user);

		if (!result || result.affectedRows !== 1)
			throw new CustomError('Unexpected errors occurred');

		return lang;
	},

	/**
	 * Validates user data
	 * @param {object} user
	 * @param {boolean} validatePassword determines if password validation is executed
	 * @returns true or errors array
	 */
	validate(user, validatePassword = false) {
		if (!user) return ['Wrong user information'];

		const errors = [];

		if (!user.username || user.username.length > 40 || user.username < 2)
			errors.push('User name (2-40 chars)');

		// validate fullname only if provided
		if (user.fullname && (user.fullname.length > 80 || user.fullname < 2))
			errors.push('Full name (2-80 chars)');

		if (
			!user.email ||
			//eslint-disable-next-line
			!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(user.email) ||
			user.email.length > 191
		)
			errors.push('Invalid email address');

		// validate photo only if provided
		if (user.photo && (user.photo.length > 80 || user.fullname < 3))
			errors.push('Photo name (3-80 chars)');

		// validate language
		if (!language.definedLangs.includes(user.language.toUpperCase()))
			throw new CustomError('Language not defined');

		if (validatePassword) {
			if (!user.pass || !user.confirm) {
				errors.push('Wrong password');
			} else if (user.pass !== user.confirm) {
				errors.push('Password and confirmation do not match');
			} else if (user.pass.length < 6) {
				errors.push('Password (1-6 chars)');
			}
		}

		if (errors.length > 0) return errors.join('\n');
		return true;
	},

	/**
	 * Returns true if username exists false otherwise
	 * @param {string} username
	 * @returns {boolean}
	 */
	async exists(username) {
		if (!username) throw new CustomError('Wrong username');

		const result = await repository.getOne(
			{ username: username.toString() },
			uiFields
		);
		if (!result) return false;
		return true;
	},
};

module.exports = userService;
