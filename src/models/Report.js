const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema(
	{
		check: {
			type: Schema.Types.ObjectId,
			ref: 'Check',
		},
		status: {
			type: String,
		},
		statusCode: {
			type: Number,
		},
		availability: {
			type: Number,
		},
		outages: {
			type: Number,
		},
		downtime: {
			type: Number,
			default: 0,
		},
		uptime: {
			type: Number,
			default: 0,
		},
		responseTime: {
			type: Number,
			default: 0,
		},
		history: {
			type: Number,
			default: 10,
		},
	},
	{
		timestamps: true,
	}
);

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
