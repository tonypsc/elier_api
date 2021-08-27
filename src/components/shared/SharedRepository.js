const db = require('../../services/mysql');

class SharedRepository {
	constructor(table, keyField) {
		this.table = table;
		this.keyField = keyField;
	}

	/**
	 * Gets one
	 * @param {object} search
	 */
	getOne(where, order, fields = '*') {
		let sql = `SELECT ${fields} from ${this.table}`;
		const params = [];

		if (where) {
			sql += where.fields;
			params.push(where.values);
		}

		if (order) {
			sql += ' ORDER BY ?';
			params.push(order);
		}

		return db.execute(sql, params);
	}

	getById(id, fields = '*') {
		const sql = `SELECT ${fields} from ${this.table} where ${this.keyField} = ?`;
		return db.execute(sql, [id]);
	}

	count(where) {
		let sql = `SELECT COUNT * from ${this.table} where ${where} `;
		const params = [];

		if (where) {
			sql += where.fields;
			params.push(where.values);
		}
		return db.execute(sql, params);
	}

	get(where, fields = '*', order, page = 0, pageSize = 10) {
		const skip = page * pageSize;
		let sql = `SELECT ${fields} from ${this.table} LIMIT ${skip}, ${pageSize} `;
		const params = [];

		if (where) {
			sql += where.fields;
			params.push(where.values);
		}

		if (order) {
			sql += ' ORDER BY ?';
			params.push(order);
		}

		return db.execute(sql, params);
	}

	insert(resource) {
		const fields = Object.keys(resource).join(', ');
		let values = Object.values(resource);
		values = values.map(() => '?').join(', ');
		const sql = `INSERT INTO ${this.table} (${fields}) VALUES (${values}) `;
		return db.execute(sql, Object.values(resource));
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
}

module.exports = SharedRepository;
