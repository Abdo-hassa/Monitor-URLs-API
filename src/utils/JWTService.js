const jwt = require('jsonwebtoken');

exports.generateToken = (payload, expiresToken = '2d', option) => {
	if (option) {
		return jwt.sign(payload, process.env.REST_TOKEN_SECRET, { expiresIn: expiresToken });
	}
	return {
		accessToken: jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: expiresToken }),
		refreshToken: jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: expiresToken }),
	};
};

exports.verifyToken = (token, option) => {
	let SecretKey;
	if (option === 'refresh') {
		SecretKey = process.env.REFRESH_TOKEN_SECRET;
	} else if (option === 'reset') {
		SecretKey = process.env.REST_TOKEN_SECRET;
	} else {
		SecretKey = process.env.SECRET_KEY;
	}
	return jwt.verify(token, SecretKey);
};
