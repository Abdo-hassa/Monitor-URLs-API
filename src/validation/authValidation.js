const { body, check } = require('express-validator');
const User = require('../models/User');

exports.loginValidator = [check('email').exists().isEmail().withMessage('this email is not valid').normalizeEmail()];

exports.registerValidator = [
	check('email')
		.exists()
		.isEmail()
		.withMessage('this email is not valid')
		.normalizeEmail()
		.custom((value, { req }) => {
			return User.findOne({ email: value }).then(userDoc => {
				if (userDoc) {
					return Promise.reject('this email is already exist');
				}
				return true;
			});
		}),
	body(
		'password',
		'The Password should exists and contains numbers, text or both and should be minimum 6 characters long.'
	)
		.exists()
		.withMessage('Password is not exist')
		.isLength({ min: 6 })
		.withMessage('Password field should be 6 characters minimum')
		.isAlphanumeric()
		.trim()
];


