const asyncHandler = require('express-async-handler');
const { ErrorHandler } = require('../helpers/ErrorHandler');
const User = require('../models/User');
const { verifyToken } = require('../utils/JWTService');

exports.isAuth = asyncHandler(async (req, res, next) => {
	if (!req.headers?.authorization && !req.headers?.authorization?.startsWith('Bearer')) {
		throw new ErrorHandler(401, 'Not authenticated');
	} else {
		const token = req.headers.authorization.split(' ')[1];
		let decodedToken = verifyToken(token);
		let user = await User.findById(decodedToken._id);
		req.user = user.hidePrivateData();
		if (!req.user) {
			throw new ErrorHandler(401, 'Invalid token.');
		}
		next();
	}
});

exports.isAdmin = asyncHandler(async (req, res, next) => {
	if (req.user.isAdmin) {
		next();
	} else {
		throw new ErrorHandler(403, 'Admins only allowed to do that');
	}
});

exports.isAuthorized = asyncHandler(async (req, res, next) => {
	if (req.user.id.toString() == req.params.id || req.user.isAdmin) {
		next();
	} else {
		throw new ErrorHandler(403, 'You are not allow to do that');
	}
});
