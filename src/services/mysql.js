const mysql = require('mysql2');
const config = require('../config');

function connection() {
	try {
		const dbSettings = {
			debug: false,
			host: config.DB_HOST,
			user: config.DB_USER,
			password: config.DB_PASS,
			database: config.DB_NAME,
			connectionLimit: 10,
			waitForConnections: true,
			queueLimit: 0,
		};
		const pool = mysql.createPool(dbSettings);
		return pool.promise();
	} catch (error) {
		return console.log(`Could not connect - ${error}`);
	}
}

const pool = connection();

module.exports = {
	query: async (...params) => {
		//try {
		const connection = await pool.getConnection();
		const [data] = await connection.query(...params);
		await connection.release();
		return data;
		// } catch (e) {
		// 	console.log(e);
		// }
	},

	execute: async (...params) => {
		//try {
		const connection = await pool.getConnection();
		const [data] = await connection.execute(...params);
		await connection.release();
		return data;
		// } catch (e) {
		// 	console.log(e);
		// }
	},

	pool,
};
