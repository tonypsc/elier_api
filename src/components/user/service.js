const bcrypt = require('bcrypt');
const constants = require('../../constants');
const crypto = require('crypto');
const SharedRepository = require('../shared/SharedRepository');
// const mailer = require('../services/mailer');

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
		delete user.password;
		return { status: 'success', data: user };
	},

	async recover(emailAddress) {
		//Check email exists
		const user = await repository.getOne({ email: emailAddress });
		if (!user)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Dirección de correo incorrecta.',
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
				message: 'Enlace incorrecto.',
			};

		// Verify link is active (24h)
		const linkCreated = user.linkCreated ? user.linkCreated : 0;
		const hours = (Date.now() - linkCreated) / 1000 / 60 / 60;
		console.log({ hours, linkCreated });
		if (hours > 24)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'El enlace ha expirado.',
			};

		return user;
	},

	async resetPwd(link, password, confirm) {
		if (!link)
			throw { code: constants.CUSTOM_ERROR_CODE, message: 'Enlace incorrecto' };

		// Check link
		const user = await this.verifyLink(link);
		return this.setPwd(user, password, confirm);
	},

	async changePwd(_id, oldPwd, newPwd, confirm) {
		console.log({ _id });

		// Verify old password
		const user = await repository.getOne({ _id: _id });

		console.log({ user, oldPwd });

		if (!user)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Usuario incorrecto.',
			};
		if (!bcrypt.compareSync(oldPwd, user.password))
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Contraseña anterior incorrecta.',
			};

		return this.setPwd(user, newPwd, confirm);
	},

	/**
	 * Admin set password for user
	 */
	async newPwd(_id, password, confirm) {
		const user = await this.getById(_id);
		return this.setPwd(user, password, confirm);
	},

	setPwd(user, password, confirm) {
		if (!password)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Contraseña incorrecta',
			};
		if (password !== confirm)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'La contraseña y la confirmación no son iguales.',
			};

		// Crypt pwd
		const salt = bcrypt.genSaltSync(10);
		const hashedPwd = bcrypt.hashSync(password, salt);
		const newUser = { ...user, password: hashedPwd };

		// Update user
		return repository.update(user._id, newUser);
	},

	async insert(
		userName,
		fullName,
		password,
		confirm,
		email,
		photo,
		rol = 'user',
		enterpriseId,
		enterpriseName
	) {
		if (password != confirm)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Las contraseñas deben ser iguales.',
			};
		if (rol !== 'sa' && !enterpriseId)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Es obligatorio seleccionar la empresa.',
			};

		const salt = bcrypt.genSaltSync(10);
		const hashedPwd = bcrypt.hashSync(password, salt);

		const user = {
			userName,
			fullName,
			password: hashedPwd,
			photo,
			email,
			rol,
			enterpriseId,
			enterpriseName,
		};

		return await repository.insert(user);
		//return repository.getOne({userName: userName}, uiFields);
	},

	async get(userId, enterpriseId = null, search, page, limit) {
		page = page < 0 ? 0 : page - 1;
		let fullSearch = { _id: { $ne: userId }, deleted: false };

		if (enterpriseId)
			fullSearch = { ...fullSearch, enterpriseId: enterpriseId };

		if (search) {
			fullSearch = {
				...fullSearch,
				$or: [
					{ userName: { $regex: search, $options: 'i' } },
					{ fullName: { $regex: search, $options: 'i' } },
					{ email: { $regex: search, $options: 'i' } },
					{ rol: { $regex: search, $options: 'i' } },
				],
			};
		}

		const total = await repository.count(fullSearch);
		const users = await repository.getAll(
			fullSearch,
			uiFields,
			{ _id: -1 },
			page,
			limit
		);

		return { total, users };
	},

	async getById(_id) {
		if (!_id)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'El id del usuario es obligatorio.',
			};
		const result = await repository.getById(_id, uiFields);
		if (!result)
			throw {
				code: constants.CUSTOM_ERROR_CODE,
				message: 'Usuario no encontrado.',
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
};

module.exports = userService;
