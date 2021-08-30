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
		const newUser = { ...user, recoverLink: link, linkCreated: Date.now() };

		await repository.update(user._id, newUser);
		// return mailer.sendMail(
		// 	emailAddress,
		// 	'ficos, Enlace de recuperación de contraseña',
		// 	`Ha solicitado recuperar su contraseña, para continuar debe hacer click en el siguiente enlace<br/>
		// 	    "El enlace caduca en 24 horas"<br/>
		// 	    <a href="${link}">${link}</a>`
		// );
		return true;
	},

	async verifyLink(link) {
		// Verify link is valid
		const user = await repository.getOne({ recoverLink: link });
		if (!user)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Wrong link.',
			};

		// Verify link is active (24h)
		const linkCreated = user.linkCreated ? user.linkCreated : 0;
		const hours = (Date.now() - linkCreated) / 1000 / 60 / 60;
		console.log({ hours, linkCreated });
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

	async changePwd(user_id, oldPwd, newPwd, confirm) {
		// Verify old password
		const user = await repository.getOne({ user_id: user_id });

		if (!user)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Wrong user.',
			};
		if (!bcrypt.compareSync(oldPwd, user.password))
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Wrong current password.',
			};

		return this.setPwd(user, newPwd, confirm);
	},

	/**
	 * Admin set password for user
	 */
	async newPwd(user_id, password, confirm) {
		const user = await this.getById(user_id);
		return this.setPwd(user, password, confirm);
	},

	setPwd(user, password, confirm) {
		if (!password)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Wrong password',
			};
		if (password !== confirm)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'New password and confirmation don`t match',
			};

		// Crypt pwd
		const salt = bcrypt.genSaltSync(10);
		const hashedPwd = bcrypt.hashSync(password, salt);
		const newUser = { ...user, password: hashedPwd };

		// Update user
		return repository.update(user.user_id, newUser);
	},

	/**
	 * Inserts the user object in user table
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
		if (password != confirm)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Passwords do not match',
			};

		const salt = bcrypt.genSaltSync(10);
		const hashedPwd = bcrypt.hashSync(password, salt);
		const user_id = repository.getUUID();

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
		if (!user_id)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'User id is required',
			};
		const result = await repository.getById(user_id, uiFields);
		if (!result)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'User not found',
			};
		return result;
	},

	delete(userId, authUserId) {
		if (!userId)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'El id del usuario es obligatorio.',
			};

		//trying to delete himself
		if (userId == authUserId)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Imposible eliminar el usuario activo.',
			};

		const updateUser = {
			deleted: true,
		};

		return repository.update(userId, updateUser);
	},

	async update(_id, userName, fullName, email, rol, photo, status) {
		const user = {
			userName,
			fullName,
			email,
			rol,
			photo,
			status,
		};

		await repository.update(_id, user);
		return repository.getById(_id, uiFields);
	},

	validate(user) {},
};

module.exports = userService;
