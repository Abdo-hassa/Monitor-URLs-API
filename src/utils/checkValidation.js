const { validationResult } = require('express-validator');
const { ErrorHandler } = require('../helpers/ErrorHandler');

exports.checkValidationErrors = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		let error = new ErrorHandler(422, errors.array()[0].msg);
		throw error;
	}

	return next();
};
