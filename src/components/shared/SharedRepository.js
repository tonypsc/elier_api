const db = require('../../services/mysql');
const crypto = require('crypto');

class SharedRepository {
	constructor(table, keyField) {
		this.table = table;
		this.keyField = keyField;
	}

	/**
	 * Gets one
	 * @param {object} search
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

		return db
			.execute(sql, params)
			.then((data) => new Promise((resolve) => resolve(data[0])))
			.catch((err) => new Promise((reject) => reject(err)));
	}

	getById(id, fields = ['*']) {
		const sql = `SELECT ${fields.join(', ')} from ${this.table} where 
			${this.keyField} = ?`;
		return db.execute(sql, [id]);
	}

	count(where) {
		let sql = `SELECT COUNT * from ${this.table} `;
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

		return db
			.execute(sql, params)
			.then((res) => new Promise((resolve) => resolve(res[0]['COUNT(*)'])))
			.catch((err) => new Promise((reject) => reject(err)));
	}

	get(where, fields = '*', order, page = 0, pageSize = 10) {
		const skip = page * pageSize;
		let sql = `SELECT ${fields} from ${this.table} LIMIT ${skip}, ${pageSize} `;
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
			params = Object.values(whereValues);
		}

		if (order) {
			sql += ' ORDER BY ? ';
			params.push(order);
		}

		sql += `LIMIT ${skip}, ${limit}`;

		console.log(sql);

		return db.execute(sql, params);
	}

	insert(resource) {
		const fields = Object.keys(resource).join(', ');
		const values = Object.values(resource).map((v) =>
			v === undefined ? null : v
		);
		const valuesPlaceHolder = values.map(() => '?').join(', ');
		const sql = `INSERT INTO ${this.table} (${fields}) VALUES (${valuesPlaceHolder}) `;
		return db.execute(sql, values);
	}

	delete(id) {
		const sql = `DELETE FROM ${this.table} WHERE ${this.keyField} = ?`;
		return db.execute(sql, [id]);
	}

	update(id, resource) {
		const fields = Object.keys(resource).join(', ');
		const values = [];

		for (const field in fields) {
			const value =
				typeof resource[field] === 'string'
					? `'${resource[field]}'`
					: `${resource[field]}`;
			values.push(`${field} = ${value}`);
		}

		const sql = `UPDATE ${this.table} SET (${values.join(', ')}) WHERE id = ?`;
		db.execute(sql, [id]);
	}

	getUUID() {
		return (
			new Date().getTime().toString(36) + crypto.randomBytes(12).toString('hex')
		);
	}
}

module.exports = SharedRepository;
