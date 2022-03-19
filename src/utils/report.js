const Check = require('../models/Check');
const Report = require('../models/Report');
const asyncHandler = require('express-async-handler');
const { sendmail } = require('../utils/SendingMails');

exports.createReport = asyncHandler(async data => {
	for (let key in data) {
		const check = await Check.findOne({ url: key }).populate('user');
		const report = await new Report({
			check: check,
			statusCode: data[key].statusCode,
			status: data[key].status,
			responseTime: data[key].time,
		}).save();
    // console.log(report)
		sendmail(
			check.user.email,
			'Report mail',
			`<p>Your Report</p><p> Your URL ${check.url} Status is ${report.status} .</p><br><p> And  StatusCode is ${report.statusCode} .</p><br> `
		);
	}
});
