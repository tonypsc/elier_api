const SharedRepository = require('../shared/SharedRepository');
const CustomError = require('../../error/CustomError');

const repository = new SharedRepository('notification', 'notification_id');

const uiFields = [
	'notification_id',
	'title',
	'notification',
	'url',
	'readed',
	'created_on',
];

const service = {
	/**
	 * Returns all the notifications for the user
	 * @param {string} user_id
	 * @param {bool} unread // only read notificatios
	 * @returns {promise}
	 */
	async getAll(user_id, unread = true) {
		if (!user_id) throw new CustomError('Wrong user_id');
		const search = { user_id: user_id.toString() };
		if (unread) search.readed = 0;
		return repository.getAll(search, uiFields);
	},

	async add(user_id, title, notification_text, url) {
		const validationResult = this.validate(
			user_id,
			title,
			notification_text,
			url
		);
		if (validationResult !== true) throw new CustomError(validationResult);
		const notification_id = repository.getUUID();

		const notification = {
			notification_id,
			user_id: user_id.toString(),
			title: title.toString(),
			notification: notification_text.toString(),
			url: url ? url.toString() : null,
			created_on: new Date().getTime(),
		};

		const result = await repository.insert(notification);

		if (!result || result.affectedRows !== 1)
			throw new CustomError('Unexpected errors ocurred');

		return repository.getById(notification_id, uiFields);
	},

	/**
	 * Marcks notification as readed
	 * @param {string} notification_id
	 * @returns {promise}
	 */
	async markRead(notification_id) {
		if (!notification_id) throw new CustomError('Wrong notification_id');
		const result = await repository.update(notification_id.toString(), {
			readed: 1,
		});

		if (!result || result.affectedRows !== 1)
			throw new CustomError('No data changed');

		return true;
	},

	/**
	 * Marks as readed all notifications for the user
	 * @param {string} user_id
	 * @returns {boolean}
	 */
	async markAllUser(user_id) {
		if (!user_id) throw new CustomError('Wrong user_id');

		const result = await repository.updateEx(
			'user_id = ?',
			[user_id.toString()],
			{
				readed: 1,
			}
		);

		if (!result || result.affectedRows === 0)
			throw new CustomError('No data changed');

		return true;
	},

	/**
	 *
	 * @param {string} user_id
	 * @param {string} title
	 * @param {string} notification
	 * @param {string} url
	 * @returns true or errors array
	 */
	validate(user_id, title, notification, url) {
		const errors = [];

		if (!user_id || user_id.length > 32) errors.push('Wrong user_id');
		if (!title || title.length > 150) errors.push('Title (1-150 chars)');
		if (!notification || notification.length > 255)
			errors.push('Notification (1-255 chars)');
		if (url && url.length > 255) errors.push('Url (1-255 chars)');

		if (errors.length > 0) return errors.join('\n');

		return true;
	},
};

module.exports = service;
