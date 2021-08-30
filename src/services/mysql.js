const mysql = require('mysql2');

function connection() {
	try {
		const dbSettings = {
			debug: false,
			host: '127.0.0.1',
			user: 'root',
			password: 'root',
			database: 'elier',
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
		// try {
		const connection = await pool.getConnection();
		const [data, e] = await connection.query(...params);
		await connection.release();
		return data;
		// } catch (e) {
		// 	console.log(e);
		// }
	},

	execute: async (...params) => {
		//try {
		const connection = await pool.getConnection();
		const [data, col] = await connection.execute(...params);
		await connection.release();
		return data;
		// } catch (e) {
		// 	console.log(e);
		// }
	},

	pool,
};
