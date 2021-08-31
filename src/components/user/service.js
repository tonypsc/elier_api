const bcrypt = require('bcrypt');
const constants = require('../../constants');
const crypto = require('crypto');
const SharedRepository = require('../shared/SharedRepository');
// const mailer = require('../services/mailer');
const dto = require('./dto');

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

const repository = new SharedRepository('user', 'user_id');

const userService = {
	/**
	 * Checks if user exists, is active and has proper credentials
	 * @param {*} userName
	 * @param {*} password
	 * @returns {object} user data
	 */
	async login(userName, password) {
		const user = await repository.getOne({ username: userName });

		// user does not exists
		if (!user)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'User not found.',
			};

		// user is inactive
		if (user.status !== 1)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'User account disabled.',
			};

		// check password
		if (
			!bcrypt.compareSync(password, user.pass)
			// &&	!bcrypt.compareSync(password, saUser.password)
		)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Wrong credentials.',
			};

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
		const user = await repository.getOne({ email: emailAddress });

		if (!user)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Wrong email address.',
			};

		// Create recover link
		const link = crypto.randomBytes(32).toString('hex');
		const newUser = {
			...user,
			recover_link: link,
			link_created_on: Date.now(),
		};

		await repository.update(user.user_id, newUser);

		// return mailer.sendMail(
		// 	emailAddress,
		// 	'elier.org, Password recovery link',
		// 	`You have requested to recover your password, click link to continue<br/>
		// 	    "This link expires in 24 hours"<br/>
		// 	    <a href="${link}">${link}</a>`
		// );
		return true;
	},

	/**
	 * Returns the user with the link,
	 * raises an error if user not found or link expired
	 * @param {string} link
	 * @returns {object}
	 */
	async verifyLink(link) {
		// Verify link
		const user = await repository.getOne({ recover_link: link });
		if (!user)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Wrong link.',
			};

		// Verify link is active (24h)
		const linkCreated = user.link_created_on ? user.link_created_on : 0;
		const hours = (Date.now() - linkCreated) / 1000 / 60 / 60;

		if (hours > 24)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Link expired.',
			};

		return user;
	},

	async resetPwd(link, password, confirm) {
		if (!link)
			throw { code: constants.CUSTOM_ERROR_CODE, message: 'Wrong link' };

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
		// Verify old password
		const user = await repository.getById(user_id);

		if (!user)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Wrong user.',
			};
		if (!oldPwd || !bcrypt.compareSync(oldPwd, user.pass))
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Wrong current password.',
			};

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
		if (!user)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Wrong user',
			};

		if (!password || password.length < 6)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Wrong password (6-64 chars)',
			};

		if (password !== confirm)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'New password and confirmation don`t match',
			};

		// Crypt pwd
		const salt = bcrypt.genSaltSync(10);
		const hashedPwd = bcrypt.hashSync(password, salt);
		const newUser = { ...user, pass: hashedPwd };

		// Update user
		return repository.update(user.user_id, newUser);
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

		if (validationResult !== true)
			throw { code: constants.CUSTOM_ERROR_CODE, message: validationResult };

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
			searchValues = [search, search, search];
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

	async getById(user_id) {
		const result = await repository.getById(user_id, uiFields);

		if (!result)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'User not found',
			};

		return result;
	},

	/**
	 * Deletes the user
	 * @param {string} user_id
	 * @returns {promise}
	 */
	async delete(user_id) {
		const result = await repository.delete(user_id);
		if (!result || result.affectedRows === 0) {
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'User not found',
			};
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

		if (validationResult !== true)
			throw { code: constants.CUSTOM_ERROR_CODE, message: validationResult };

		const result = await repository.update(user_id, user);

		if (!result || result.affectedRows === 0) {
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Errors ocurred or user not found',
			};
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

		if (!user.fullname || user.fullname.length > 80 || user.fullname < 2)
			errors.push('Full name (2-80 chars)');

		if (
			!user.email ||
			//eslint-disable-next-line
			!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(user.email)
		)
			errors.push('Invalid email address');

		if (validatePassword) {
			if (!user.password || !user.confirm) {
				errors.push('Wrong password');
			} else if (user.password !== user.confirm) {
				errors.push('Password and confirmation do not match');
			} else if (user.password.length < 6) {
				errors.push('Password (1-6 chars)');
			}
		}

		if (errors.length > 0) return errors.join('\n');
		return true;
	},
};

module.exports = userService;
