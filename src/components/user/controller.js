const service = require('./service');
const errorHandling = require('../../error/errorHandling');
const jwt = require('../../middleware/jwtauth');
const formidable = require('formidable');
const path = require('path');
const fileHelper = require('../../utils/fileHelper');
const fs = require('fs');

const userController = {
	async login(req, res) {
		// captcha protected

		try {
			const { username, pwd } = req.body;

			const captcha = req.body['g-recaptcha-response'];
			const result = await service.login(
				username,
				pwd,
				captcha,
				userController.getIpAddress(req)
			);

			const token = jwt.generateToken({
				user_id: result.user_id,
				role_id: result.role_id,
			});

			res.json({ status: 'success', user: result, token });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	async recover(req, res) {
		// captcha protected
		try {
			const captcha = req.body['g-recaptcha-response'];
			await service.recover(
				req.body.email,
				req.body.language,
				captcha,
				userController.getIpAddress(req)
			);
			res.json({ status: 'success' });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	/**
	 * Checks if link provided is correct to show set password dialog on front
	 */
	async verifyLink(req, res) {
		try {
			await service.verifyLink(req.params.id);
			res.json({ status: 'success' });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	async resetPassword(req, res) {
		try {
			const { link, password, confirm } = req.body;
			await service.resetPwd(link, password, confirm);
			res.json({ status: 'success' });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	async setPassword(req, res) {
		try {
			const { user_id, password, confirm } = req.body;
			const user = await service.getById(user_id);
			await service.setPwd(user, password, confirm);
			res.json({ status: 'success' });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	async changePassword(req, res) {
		try {
			const { old, password, confirm } = req.body;

			await service.changePwd(req.user.user_id, old, password, confirm);
			res.json({ status: 'success' });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	async register(req, res) {
		// captcha protected
		try {
			const { fullname, password, confirm, email, language } = req.body;
			const captcha = req.body['g-recaptcha-response'];

			const result = await service.register(
				fullname,
				email,
				password,
				confirm,
				language,
				captcha,
				userController.getIpAddress(req)
			);

			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	/**
	 * Re-sends confirmation link to user if prvious didnt arrived or expired
	 */
	async sendConfirmationLink(req, res) {
		try {
			const result = await service.sendConfirmationLink(
				req.body.email,
				req.body.language
			);

			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	async confirmRegister(req, res) {
		try {
			const result = await service.confirmRegistation(req.params.link);

			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	async get(req, res) {
		try {
			const { search, page, limit } = req.query;
			const items = await service.get(search, page, limit);
			res.json({ status: 'success', data: items });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	async delete(req, res) {
		try {
			await service.delete(req.params.id);
			res.json({ status: 'success' });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	async update(req, res) {
		try {
			const form = new formidable.IncomingForm();

			const {
				user_id,
				username,
				fullname,
				email,
				photo,
				role_id,
				status,
				language,
			} = await new Promise((resolve, reject) => {
				form.parse(req, async function (err, fields, files) {
					if (err) {
						reject(err);
						return;
					}
					resolve({ ...fields, photo: files.photo });
				});
			});

			let uniqueFileName = null;
			if (photo) {
				uniqueFileName = fileHelper.getUniqueName(
					path.resolve('./uploads/'),
					photo.name
				);
				fs.renameSync(photo.path, path.resolve('./uploads/' + uniqueFileName));
			}

			const user = await service.update(
				user_id,
				username,
				fullname,
				email,
				role_id,
				uniqueFileName,
				status,
				language,
				req.user.role_id,
				req.user.user_id
			);
			res.json({ status: 'success', data: user });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	async getOne(req, res) {
		try {
			const user = await service.getById(req.params.id);
			res.json({ status: 'success', data: user });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	async updateProfile(req, res) {
		try {
			const form = new formidable.IncomingForm();

			const { username, fullname, email, photo, language } = await new Promise(
				(resolve, reject) => {
					form.parse(req, async function (err, fields, files) {
						if (err) {
							reject(err);
							return;
						}
						resolve({ ...fields, photo: files.photo });
					});
				}
			);

			let uniqueFileName = null;
			if (photo) {
				uniqueFileName = fileHelper.getUniqueName(
					path.resolve('./uploads/'),
					photo.name
				);
				fs.renameSync(photo.path, path.resolve('./uploads/' + uniqueFileName));
			}

			console.log(uniqueFileName);

			const user = await service.updateProfile(
				req.user.user_id,
				username,
				fullname,
				email,
				uniqueFileName,
				language,
				req.user.user_id
			);

			res.json({ status: 'success', data: user });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	async updatePhoto(req, res) {
		try {
			const form = new formidable.IncomingForm();

			const { photo } = await new Promise((resolve, reject) => {
				form.parse(req, async function (err, fields, files) {
					if (err) {
						reject(err);
						return;
					}
					resolve({ photo: files.photo });
				});
			});

			let uniqueFileName = null;
			if (photo) {
				uniqueFileName = fileHelper.getUniqueName(
					path.resolve('./uploads/'),
					photo.name
				);
				fs.renameSync(photo.path, path.resolve('./uploads/' + uniqueFileName));
			}

			await service.updatePhoto(req.user.user_id, uniqueFileName);
			res.json({ status: 'success', data: uniqueFileName });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	async updateLanguage(req, res) {
		try {
			const result = await service.updateLanguage(
				req.user.user_id,
				req.body.language
			);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	async exists(req, res) {
		try {
			const result = await service.exists(req.query.username);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400).json({ status: 'error', errors: errors });
		}
	},

	getIpAddress(req) {
		return req.connection.remoteAddress.split(':').slice(-1)[0];
	},
};

module.exports = userController;
