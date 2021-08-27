const createError = require('http-errors');
const NOT_FOUND = 404;
const SERVER_ERROR = 500;

module.exports.error404Handler = (req, res, next) => {
	next(createError(NOT_FOUND));
};

module.exports.errorHandler = (err, req, res) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// sends the error to front
	res.status(err.status || SERVER_ERROR);
	res.send({
		status: 'error',
		errors: err.message,
	});
};
