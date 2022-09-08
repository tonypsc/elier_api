const UNHANDLE_MESSAGE = 'Errors ocurred processing the request.';
const fs = require('fs');
const path = require('path');
const CustomError = require('./CustomError');

const errorHandling = {
	// proccess, logs the error and returns an string with the message
	processError(err) {
		let errorMessage = '';

		// mysql error
		if (err.type === 'mysql') {
			console.log('mysql error');
		} else if (err instanceof CustomError) {
			// custom errors
			errorMessage = err.message;
		} else {
			// unknown errors
			this.logError(err);
			errorMessage = UNHANDLE_MESSAGE;
			if (process.env.NODE_ENV === 'development') {
				errorMessage = err.toString();
				console.log(err);
			}
		}

		return errorMessage;
	},

	// writes the log in the log file
	logError(err) {
		try {
			const logFile = path.resolve(__dirname, '../', 'error.log');
			let dateTime = new Date();
			// eslint-disable-next-line no-magic-numbers
			dateTime = `${dateTime.getFullYear()}-${dateTime.getMonth() + 1}
						-${dateTime.getDate()} ${dateTime.getHours()}
						:${dateTime.getMinutes()}:${dateTime.getSeconds()}`;

			const log = `${dateTime}\n${err.message}
						\n==========================================\n`;

			const logStream = fs.createWriteStream(logFile, { flags: 'a' });
			logStream.write(log);
			logStream.end();
		} catch (error) {
			console.log(error);
		}
	},
};

module.exports = errorHandling;
