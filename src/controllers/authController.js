const User = require('../models/User');
const bcrypt = require('bcryptjs');
const uuid = require('uuid')
const asyncHandler = require('express-async-handler');
const { generateToken } = require('../utils/JWTService');
const { ErrorHandler } = require('../helpers/ErrorHandler');
const { verifyToken } = require('../utils/JWTService');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
require('dotenv').config();
const transporter = nodemailer.createTransport(
	sendgridTransport({
		auth: {
			api_key : process.env.SendGrid_Key
		},
	})
);

/**
 * @desc     Register process
 * @route    POST /auth/register
 * @access   public
 */
exports.register = asyncHandler(async (req, res, next) => {
	let { email, password } = req.body;
	const Userdata = {
		email,
		password,
	};
	let user = new User(Userdata);
	await user.save();
	res.status(201).json({ status: 'success', SavedUser: user.hidePrivateData() });
});

/**
 * @desc     Login process
 * @route    POST /auth/login
 * @access   public
 */
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email: email });

	if (!user) {
		throw new ErrorHandler(401, 'This User is not Exist');
	}

	const isEqual = await bcrypt.compare(password, user.password);
	if (!isEqual) {
		throw new ErrorHandler(401, 'Wrong password');
	}
	const payload = { email: user.email, _id: user._id };
	const { accessToken, refreshToken } = generateToken(payload);

	res
		.status(200)
		.json({ status: 'success', user: { accessToken: accessToken, refreshToken: refreshToken, _id: user._id } });
});

/**
 * @desc     Deactivate process
 * @route    POST /auth/deactivate
 * @access   users
 */
exports.Deactivate = asyncHandler(async (req, res, next) => {
	const userId = req.body.userId;
	const user = await User.findById(userId);
	if (!user && userId !== req.user._id.toString()) {
		throw new ErrorHandler(401, 'You Can not Deactivate this Account');
	}
	await user.delete();
	res.json({ message: 'User Deactivated' });
});

/**
 * @desc     Activate process
 * @route    POST /auth/activate
 * @access   users
 */
exports.Activate = asyncHandler(async (req, res, next) => {
	const userId = req.body.userId;
	const user = await User.findById(userId);
	if (!user && userId !== req.user._id.toString()) {
		throw new ErrorHandler(401, 'You Can not Activate this Account');
	}
	await user.restore();
	res.json({ message: 'User Activated' });
});

/**
 * @desc     Refresh Token process
 * @route    POST /auth/refresh
 * @access   users
 */
exports.refreshToken = asyncHandler(async (req, res, next) => {
	if (!req.headers?.refresh && !req.headers?.refresh?.startsWith('Bearer')) {
		throw new ErrorHandler(401, 'Invalid token');
	}
	const token = req.headers.refresh.split(' ')[1];
	const decodedRefreshToken = verifyToken(token, 'refresh');

	if (decodedRefreshToken && decodedRefreshToken.email === req.user.email) {
		const payload = { email: req.user.email, _id: req.user._id };
		const { accessToken, refreshToken } = generateToken(payload);
		res.json({ accessToken, refreshToken });
	}
});

/**
 * @desc     reset password process
 * @route    POST /auth/reset
 * @access   users
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
	const { email } = req.body;
	const user = await User.findOne({ email: email });
	if (!user) {
		throw new ErrorHandler(401, 'No account with that email found.');
	}
	const id = uuid.v4();
	let resetCode = id.slice(0, 6);
	const payload = { email: user.email, resetCode: resetCode };

	const resetToken = generateToken(payload, '15m', 'reset');
	user.resetToken = resetToken;
	await user.save();

	transporter.sendMail({
		to: email,
		from: process.env.Sender_Email,
		subject: 'Password reset',
		html: `
<p>You requested a password reset.</p>
<p> Your Rest Code is ${resetCode}.</p>
`,
	});

	res.status(200).json({ status: 'code sent', resetData: { resetToken: resetToken, resetCode: resetCode } });
});

/**
 * @desc    new password process
 * @route    POST /auth/newpass
 * @access   users
 */
exports.newPassword = asyncHandler(async (req, res, next) => {
	const { newPassword, recivedcode, recivedToken } = req.body;
	if (recivedToken.exp * 1000 < new Date().getTime()) {
		throw new ErrorHandler(401, 'token expired');
	}
	let decodedToken = verifyToken(recivedToken, 'reset');
	if (decodedToken.resetCode != recivedcode) {
		throw new ErrorHandler(401, 'Wrong Code');
	}
	const user = await User.findOne({ '$and': [{ email: decodedToken.email }, { resetToken: recivedToken }] });
	user.password = newPassword;
	await user.save();

	transporter.sendMail({
		to: decodedToken.email,
		from: process.env.Sender_Email,
		subject: 'Password reset',
		html: `
<p>password updated successfully.</p>
`,
	});

	res.status(200).json({ status: 'Password updated' });
});
