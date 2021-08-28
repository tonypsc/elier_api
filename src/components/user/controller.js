const service = require('./service');
const errorHandling = require('../../services/errorHandling');
const jwt = require('../../middleware/jwtauth');
const constants = require('../../constants');
const formidable = require('formidable');
const path = require('path');
const fileHelper = require('../../utils/fileHelper');
const fs = require('fs');

const userController = {
	/**
	 * process login request and returns token or errors
	 */
	async login(req, res) {
		try {
			const { username, pwd } = req.body;
			const result = await service.login(username, pwd);

			result['token'] = jwt.generateToken({
				userId: result['data']._id,
				rol: result['data'].rol,
			});

			res.json(result);
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},

	async recover(req, res) {
		try {
			await service.recover(req.body.email);
			res.json({ status: 'success' });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},

	async verifyLink(req, res) {
		try {
			await service.verifyLink(req.params.id);
			res.json({ status: 'success' });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},

	async resetPassword(req, res) {
		try {
			const { link, password, confirm } = req.body;
			await service.resetPwd(link, password, confirm);
			res.json({ status: 'success' });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},

	async setPassword(req, res) {
		try {
			const { _id, password, confirm } = req.body;
			const user = await service.getById(_id);
			await service.setPwd(user, password, confirm);
			res.json({ status: 'success' });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},

	async changePassword(req, res) {
		try {
			const { old, password, confirm } = req.body;
			await service.changePwd(req.user.userId, old, password, confirm);
			res.json({ status: 'success' });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},

	async add(req, res) {
		try {
			// Only admins and sa can create users
			if (req.user?.rol !== 'admin' && req.user?.rol !== 'sa')
				throw {
					code: constants.CUSTOM_ERROR_CODE,
					message: constants.ACCESS_DENIED_MSG,
				};

			const form = new formidable.IncomingForm();
			//form.maxFileSize = 200 * 1024 * 1024;

			const {
				userName,
				fullName,
				password,
				confirm,
				email,
				photo,
				rol,
				enterpriseId,
				enterpriseName,
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

			// Rename file
			if (photo) {
				uniqueFileName = fileHelper.getUniqueName(
					path.resolve('./uploads/'),
					photo.name
				);
				fs.renameSync(photo.path, path.resolve('./uploads/' + uniqueFileName));
			}

			const result = await service.insert(
				userName,
				fullName,
				password,
				confirm,
				email,
				uniqueFileName,
				rol,
				enterpriseId,
				enterpriseName
			);
			res.json({ status: 'success', data: result });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},

	async get(req, res) {
		try {
			const items = await service.get(
				req.user.userId,
				req.user?.enterpriseId,
				req.query.search,
				req.query.page,
				req.query.limit
			);
			res.json({ status: 'success', data: items });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},

	async delete(req, res) {
		try {
			if (req.user?.rol !== 'admin' && req.user?.rol !== 'sa')
				throw {
					code: constants.CUSTOM_ERROR_CODE,
					message: constants.ACCESS_DENIED_MSG,
				};
			await service.delete(req.params.id, req.user.userId);
			res.json({ status: 'success' });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},

	async update(req, res) {
		try {
			if (req.user?.rol !== 'admin' && req.user?.rol !== 'sa')
				throw {
					code: constants.CUSTOM_ERROR_CODE,
					message: constants.ACCESS_DENIED_MSG,
				};

			const form = new formidable.IncomingForm();

			const { _id, userName, fullName, email, photo, rol, status } =
				await new Promise((resolve, reject) => {
					form.parse(req, async function (err, fields, files) {
						if (err) {
							reject(err);
							return;
						}
						resolve({ ...fields, photo: files.photo });
					});
				});

			let uniqueFileName = null;

			// Rename file
			if (photo) {
				uniqueFileName = fileHelper.getUniqueName(
					path.resolve('./uploads/'),
					photo.name
				);
				fs.renameSync(photo.path, path.resolve('./uploads/' + uniqueFileName));
			}

			const user = await service.update(
				_id,
				userName,
				fullName,
				email,
				rol,
				uniqueFileName,
				status
			);
			res.json({ status: 'success', data: user });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},

	async getOne(req, res) {
		try {
			const user = await service.getById(req.params.id);
			res.json({ status: 'success', data: user });
		} catch (error) {
			const errors = errorHandling.processError(error);
			res.status(400);
			res.json({ status: 'error', errors: errors });
		}
	},
};

module.exports = userController;
