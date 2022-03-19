var urlmonitor = require('../urlmonitor');
const Check = require('../models/Check');
const { ErrorHandler } = require('../helpers/ErrorHandler');
const asyncHandler = require('express-async-handler');
const {createReport} = require('../utils/report')
// Load module

// create url-keeper instance

// Timer which refreshes results on time interval

exports.monitorUrl = asyncHandler(async (req, res, next) => {
	const checkId = req.params.checkId;
	const checks = await Check.find();

  urls = checks.map(check =>{
   return check.url
  })
  
	var monitor = new urlmonitor({
		interval: 60000, 
		timeout: 3000, 
		list:urls
	});

	monitor.on('change', data => {
		 createReport(data)
	});
  monitor.start();
  
  res.json({ message: 'done' });
});
