const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	name: {
		type: String,
		required: true,
	},
	url: {
		type: String,
		required: true,
	},
	protocol: {
		type: String,
	},
	path: {
		type: String,
	},
	webhook: {
		type: String,
	},
	timeout: {
		type: Number,
		default: 5,
	},
	interval: {
		type: Number,
		default: 10,
	},
	threshold: {
		type: Number,
		default: 1,
	},
	authentication: {
		type: String,
	},
	httpHeaders: [{ x :String, y:String }],
  assert: {
    type: Number,
  },
  tags: {
    type: [String],
  },
  ignoreSSL: {
    type: Boolean,
  },
  
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
