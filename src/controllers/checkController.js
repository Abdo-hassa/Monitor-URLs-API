const Check = require('../models/Check');
const asyncHandler = require('express-async-handler');
const { generateToken } = require('../utils/JWTService');
const { verifyToken } = require('../utils/JWTService');
const { ErrorHandler } = require('../helpers/ErrorHandler');
const { sendmail } = require('../utils/SendingMails');
require('dotenv').config();

exports.createCheck = asyncHandler(async (req, res, next) => {
	const checkdata = { ...req.body, user: req.user };
	// const check = await new Check(req.body);
	// res.json({ message: 'Check created ', check: check });
});
