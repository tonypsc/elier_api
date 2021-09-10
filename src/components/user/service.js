const bcrypt = require('bcrypt');
const crypto = require('crypto');
const SharedRepository = require('../shared/SharedRepository');
const dto = require('./dto');
const mailer = require('../../services/mailer');
const config = require('../../config/default');
const CustomError = require('../../error/CustomError');

const uiFields = [
	'user_id',
	'userName',
	'fullName',
	'email',
	'photo',
	'status',
	'rol_id',
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
	async login(userName, password) {
		if (!userName || !password) throw new CustomError('Wrong input data');

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
	async recover(emailAddress) {
		//Check email exists
		if (!emailAddress) throw new CustomError('Email address is required');

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
			'elier.org, Password recovery link',
			`You have requested to recover your password, click link to continue<br/>
						"This link expires in 24 hours"<br/>
						<a href="http://elier.org/${link}">Recover password</a>`
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
	async register(fullname, email, pass, confirm) {
		let user = {
			username: email,
			fullname: fullname || email,
			pass,
			confirm,
			email,
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
			rol_id: 'user',
			created_on: new Date().getTime(),
			status: UNCONFIRMED,
			confirmation_link,
		};

		delete user.confirm;

		await repository.insert(user);

		await mailer.sendMail(
			email,
			'elier.org, Confirm registration',
			`You have successfully registered in elier.org, click the link below to complete the registration process<br/>
						"This link expires in 72 hours"<br/>
						<a href="http://elier.org/${confirmation_link}"><h3>Confirm registration</h3></a>`
		);

		return repository.getById(user_id, uiFields);
	},

	/**
	 * Sends the confirmation link to user
	 * @param {string} email
	 */
	async sendConfirmationLink(email) {
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
			throw new CustomError('Unexpected errors ocurred');
		}

		// send email
		return mailer.sendMail(
			email,
			'elier.org, Confirm registration',
			`You have successfully registered in elier.org, click the link below to complete the registration process<br/>
			    "This link expires in 72 hours"<br/>
			    <a href="http://elier.org/${confirmation_link}"><h3>Confirm registration</h3></a>`
		);
	},

	/**
	 * Marks user status as active
	 * @param {string} link
	 */
	async confirmRegistation(link) {
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

		if (!result || result.affectedRows === 0) {
			throw new CustomError('Unexpected errors ocurred');
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
	 * @param {string} rol_id
	 * @returns {promise} with the inserted object
	 */
	async insert(username, fullname, password, confirm, email, photo, rol_id) {
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
			rol_id,
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
	 * @param {string} rol_id
	 * @param {string} photo
	 * @param {boolean} status
	 * @returns
	 */
	async update(user_id, username, fullname, email, rol_id, photo, status) {
		const user = {
			username,
			fullname,
			email,
			rol_id,
			photo,
		};

		if (status !== undefined) user.status = status;

		// validate fields
		const validationResult = this.validate(user);

		if (validationResult !== true) throw new CustomError(validationResult);

		const result = await repository.update(user_id, user);

		if (!result || result.affectedRows === 0) {
			throw new CustomError('Errors ocurred or user not found');
		}

		return repository.getById(user_id, uiFields);
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

		// if (!user.fullname || user.fullname.length > 80 || user.fullname < 2)
		// 	errors.push('Full name (2-80 chars)');

		if (
			!user.email ||
			//eslint-disable-next-line
			!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(user.email)
		)
			errors.push('Invalid email address');

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
