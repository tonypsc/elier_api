const db = require('../../services/mysql');
const crypto = require('crypto');
const config = require('../../config');

/**
 * Common crud operations
 */
class SharedRepository {
	constructor(table, keyField) {
		this.table = table;
		this.keyField = keyField;
	}

	/**
	 * Returns all the rows matching the criteria
	 * @param {object} where
	 * @param {array} fields
	 * @returns {promise}
	 */
	getAll(where, fields = ['*']) {
		let sql = `SELECT ${fields.join(', ')} from ${this.table} `;
		let params = [];

		if (where) {
			const fields = Object.keys(where)
				.map((f) => `${f} = ?`)
				.join(' AND ');
			sql += `WHERE ${fields}`;
			params = Object.values(where);
		}

		return db.execute(sql, params);
	}

	/**
	 * Returns the first row of the result matching the criteria
	 * @param {object} where
	 * @param {array} fields
	 * @returns {object}
	 */
	getOne(where, fields = ['*']) {
		let sql = `SELECT ${fields.join(', ')} from ${this.table} `;
		let params = [];

		if (where) {
			const fields = Object.keys(where)
				.map((f) => `${f} = ?`)
				.join(' AND ');
			sql += `WHERE ${fields}`;
			params = Object.values(where);
		}

		return db.execute(sql, params).then((data) => data[0]);
	}

	/**
	 * Returns the row with the id
	 * @param {string} id
	 * @param {array} fields
	 * @returns {object}
	 */
	getById(id, fields = ['*']) {
		const sql = `SELECT ${fields.join(', ')} from ${this.table} where 
			${this.keyField} = ?`;
		return db.execute(sql, [id]).then((res) => res[0]);
	}

	/**
	 * Counts the rows matching the criteria
	 * @param {object} where
	 * @returns {number}
	 */
	count(where) {
		let sql = `SELECT COUNT(*) from ${this.table} `;
		let params = [];

		if (where) {
			const fields = Object.keys(where)
				.map((f) => `${f} = ?`)
				.join(' AND ');
			sql += `WHERE ${fields}`;
			params = Object.values(where);
		}

		return db.execute(sql, params).then((res) => res[0]['COUNT(*)']);
	}

	/**
	 * Counts the rows matching where
	 * @param {string} where string with the conditions
	 * @returns {promise} whith the data
	 */
	countEx(where, whereValues) {
		let sql = `SELECT COUNT(*) from ${this.table} `;
		let params = [];

		if (where) {
			sql += `WHERE ${where}`;
			params = whereValues;
		}

		return db.execute(sql, params).then((res) => res[0]['COUNT(*)']);
	}

	/**
	 * Returns a set of rows matching the conditions
	 * @param {object} where
	 * @param {array} fields
	 * @param {string} order
	 * @param {number} page
	 * @param {number} limit
	 * @returns
	 */
	get(where, fields = ['*'], order, page, limit) {
		page = page || 0;
		limit = limit || config.PAGE_SIZE;
		const skip = page * limit;
		let sql = `SELECT ${fields.join(', ')} from ${
			this.table
		} LIMIT ${skip}, ${limit} `;
		let params = [];

		if (where) {
			const whereFields = Object.keys(where)
				.map((f) => `${f} = ?`)
				.join(' AND ');
			sql += `WHERE ${whereFields}`;
			params = Object.values(where);
		}

		if (order) {
			sql += ' ORDER BY ?';
			params.push(order);
		}

		return db.execute(sql, params);
	}

	/**
	 * Returns a set of rows matching the conditions
	 * @param {string} where
	 * @param {array} whereValues
	 * @param {array} fields
	 * @param {string} order
	 * @param {number} page
	 * @param {number} pageSize
	 * @returns {promise}
	 */
	getEx(where, whereValues, fields = ['*'], order, page, limit) {
		page = page || 0;
		limit = limit || 10;
		const skip = page * limit;
		let sql = `SELECT ${fields.join(', ')} from ${this.table} `;

		let params = [];

		if (where) {
			sql += `WHERE ${where}`;
			params = whereValues;
		}

		if (order) {
			sql += ' ORDER BY ? ';
			params.push(order);
		}

		sql += `LIMIT ${skip}, ${limit}`;

		return db.execute(sql, params);
	}

	/**
	 * Inserts the row
	 * @param {object} resource
	 * @returns {promise}
	 */
	insert(resource) {
		const fields = Object.keys(resource).join(', ');
		const values = Object.values(resource).map((v) =>
			v === undefined ? null : v
		);
		const valuesPlaceHolder = values.map(() => '?').join(', ');
		const sql = `INSERT INTO ${this.table} (${fields}) VALUES (${valuesPlaceHolder}) `;
		return db.execute(sql, values);
	}

	/**
	 * Inserts the row
	 * @param {object} resource
	 * @returns {promise}
	 */
	bulkInsert(resources) {
		if (!resources || !(resources instanceof Array) || resources.length === 0)
			return new Promise((reject) => reject('Invalid input data'));

		const fields = Object.keys(resources[0]).join(', ');
		let valuesPlaceHolder = '';
		let values = [];

		resources.forEach((resource) => {
			const resourceValues = Object.values(resource).map((v) =>
				v === undefined ? null : v
			);
			values = [...values, ...resourceValues];
			valuesPlaceHolder += `(${resourceValues.map(() => '?').join(', ')}),`;
		});

		valuesPlaceHolder = valuesPlaceHolder.substring(
			0,
			valuesPlaceHolder.length - 1
		);
		const sql = `INSERT IGNORE INTO ${this.table} (${fields}) VALUES ${valuesPlaceHolder} `;
		return db.execute(sql, values);
	}

	/**
	 * Deletes the row
	 * @param {string} id
	 * @returns {promise}
	 */
	delete(id) {
		const sql = `DELETE FROM ${this.table} WHERE ${this.keyField} = ?`;
		return db.execute(sql, [id]);
	}

	/**
	 * Updates the row
	 * @param {string} id
	 * @param {object} resource
	 * @returns {object}	updated resource
	 */
	update(id, resource) {
		const fields = [];
		const values = Object.values(resource);
		values.push(id);

		for (const field of Object.keys(resource)) {
			fields.push(`${field} = ?`);
		}

		const sql = `UPDATE ${this.table} SET ${fields.join(', ')} WHERE ${
			this.keyField
		} = ?`;
		return db.execute(sql, values);
	}

	/**
	 * Updates the rows matching the criteria
	 * @param {string} where
	 * @param {array} whereValues
	 * @param {object} resource
	 * @returns {promise}
	 */
	updateEx(where, whereValues, resource) {
		const fields = [];
		let values = Object.values(resource);

		for (const field of Object.keys(resource)) {
			fields.push(`${field} = ?`);
		}

		const sql = `UPDATE ${this.table} SET ${fields.join(', ')} WHERE ${where}`;

		values = [...values, ...whereValues];

		return db.execute(sql, values);
	}

	/**
	 * Returns a uuid string created using current milisecond and random string
	 * @returns {string}
	 */
	getUUID() {
		return (
			new Date().getTime().toString(36) + crypto.randomBytes(12).toString('hex')
		);
	}
}

module.exports = SharedRepository;
