const { ErrorHandler } = require('../helpers/ErrorHandler');

const errorHandler = (error, req, res, next) => {
	let { statusCode, message, stack } = error;
	statusCode = statusCode || 500,
	res.status(statusCode).json({
		status: 'error',
		statusCode: statusCode || 500,
		message: message || 'Internal Server Error',
		...(process.env.NODE_ENV === 'development' && { stack }),
	});
};

const notFound = (req, res, next) => {
	const error = new ErrorHandler(404, `Not Found - ${req.originalUrl}`);
	next(error);
};

module.exports = { errorHandler, notFound };
