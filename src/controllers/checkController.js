const Check = require('../models/Check');
const asyncHandler = require('express-async-handler');
const { generateToken } = require('../utils/JWTService');
const { verifyToken } = require('../utils/JWTService');
const { ErrorHandler } = require('../helpers/ErrorHandler');
const { sendmail } = require('../utils/SendingMails');
require('dotenv').config();

exports.createCheck = asyncHandler(async (req, res, next) => {
	const checkdata = { ...req.body, user: req.user };

	const check = await new Check(checkdata).save();
	res.json({ message: 'Check created ', check: check });
});

exports.getallchecks = asyncHandler(async (req, res, next) => {
	const checks = await Check.find({});

	res.json({ message: 'Check created ', checks: checks });
});

exports.getcheck = asyncHandler(async (req, res, next) => {
	const check = await Check.findById(req.params.checkId);
	if (!check) {
		throw new ErrorHandler(401, 'no check found ');
	}
	res.json({ message: 'Check created ', check: check });
});

exports.updateCheck = asyncHandler(async (req, res, next) => {
	const user = req.user;
	const check = await Check.findByIdAndUpdate(req.params.checkId, { ...req.body, user });
	if (!check) {
		throw new ErrorHandler(401, 'no check found ');
	}
	res.json({ message: 'Check updated', check: check });
});

exports.deleteCheck = asyncHandler(async (req, res, next) => {
	await Check.findByIdAndDelete(req.params.checkId);
	res.json({ message: 'Check Deleted' });
});
