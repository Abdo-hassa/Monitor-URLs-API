const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
require('dotenv').config();
const transporter = nodemailer.createTransport(
	sendgridTransport({
		auth: {
			api_key: process.env.SendGrid_Key,
		},
	})
);

exports.sendmail = (email, subject, html) => {
	transporter.sendMail({
		to: email,
		from: process.env.Sender_Email,
		subject: subject,
		html: html,
	});
};
