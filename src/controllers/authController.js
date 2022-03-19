const User = require('../models/User');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const asyncHandler = require('express-async-handler');
const { generateToken } = require('../utils/JWTService');
const { ErrorHandler } = require('../helpers/ErrorHandler');
const { verifyToken } = require('../utils/JWTService');
const { sendmail } = require('../utils/SendingMails');
require('dotenv').config();

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
	const accessToken = generateToken(payload);

	res
		.status(200)
		.json({ status: 'success', user: { accessToken: accessToken, _id: user._id } });
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

	sendmail(email, 'Password reset', `<p>You requested a password reset.</p><p> Your Rest Code is ${resetCode}.</p> `);

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
	sendmail(decodedToken.email, 'Password reset', `<p>password updated successfully.</p>`);
	res.status(200).json({ status: 'Password updated' });
});

/**
 * @desc    Email verification
 * @route    POST /auth/verify
 * @access   users
 */

exports.verification = asyncHandler(async (req, res, next) => {
	const { email } = req.body;
	const user = await User.findOne({ email: email });
	if (!user) {
		throw new ErrorHandler(401, 'this email is not exist');
	}
	const payload = { id: user._id };

	const sendToken = generateToken(payload);
	const sendUrl = `${process.env.Base_URL}auth/verify/${user._id}/${sendToken}`;
	sendmail(email, 'Email verification', `<p> Please verify your email click the url <a>${sendUrl}</a> </p>`);
	res.status(200).json({ message: 'email Sent' });
});

/**
 * @desc    Email confirmation
 * @route    GET /auth/verify/:userid/:token
 * @access   users
 */
exports.confirmation = asyncHandler(async (req, res, next) => {
	const { userid, token } = req.params;
	const user = await User.findById(userid);
	const decodedUser = verifyToken(token);
	if (user._id.toString() === decodedUser.id) {
		await User.updateOne({ _id: user._id, isVerified: true });
	}
	res.status(200).json({ message: 'email verified sucessfully' });
});
