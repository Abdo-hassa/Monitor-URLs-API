const app = require('../src/app');
const User = require('../src/models/User');
const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

beforeEach(done => {
	mongoose.connect(process.env.Test_MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, () => done());
});

afterEach(done => {
	mongoose.connection.db.dropDatabase(() => {
		mongoose.connection.close(() => done());
	});
});

test('POST /api/auth/register', async () => {
	const data = {
		email: 'abdooo@gmail.com',
		password: 'asdasd',
	};
	await supertest(app)
		.post('/api/auth/register')
		.send(data)
		.expect(201)
		.then(async response => {
			// Check the response
			expect(response.body.status).toBe('success');
			// Check data in the database
			const user = await User.findOne({ _id: response.body.SavedUser._id });
			expect(user._id).toBeTruthy();
			expect(user._id.toString()).toBe(response.body.SavedUser._id);
			expect(user.email).toBe(data.email);
		});
});

test('POST /api/auth/login', async () => {
	//sent data
	const data = {
		email: 'abdooo@gmail.com',
		password: 'asdasd',
	};
	//create user in testhomeMade
	const userData = {
		email: 'abdooo@gmail.com',
		password: 'asdasd',
		name: 'abdooo',
	};
	const user = await new User(userData);
	await user.save();
	//begin of the test

	await supertest(app)
		.post('/api/auth/login')
		.send(data)
		.expect(200)
		.then(async response => {
			// Check the response
			let loadedUser = response.body.user;
			decodedToken = jwt.verify(loadedUser.accessToken, process.env.SECRET_KEY);
			expect(loadedUser.id).toBe(decodedToken._id);
			expect(data.email).toBe(decodedToken.email);
			// Check data in the database
			const user = await User.findOne({ _id: loadedUser.id });
			expect(user._id.toString()).toBe(loadedUser.id);
			expect(user.email).toBe(data.email);
		});
});
