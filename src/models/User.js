const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	isVerified: { type: Boolean, default: false },
	passwordResetToken: String,
});

userSchema.pre('save', async function (next) {
	const user = this;
	const hashedPassword = await bcrypt.hash(user.password, 12);
	if (user.isModified('password')) user.password = hashedPassword;
	next();
});

userSchema.methods.hidePrivateData = function () {
	const user = this;
	const userObject = user.toObject();
	delete userObject.password;
	return userObject;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
