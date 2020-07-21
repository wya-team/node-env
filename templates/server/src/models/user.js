const mongoose = require('mongoose');
const { createModel } = require('./_common');

const Schema = mongoose.Schema;

const schema = new Schema({
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	passsalt: String,
	study: { type: Boolean, default: false },
	role: String,
	add_time: Number,
	up_time: Number,
	type: { type: String, enum: ['site', 'third'], default: 'site' } // site用户是网站注册用户, third是第三方登录过来的用户
});

module.exports = createModel('user', schema);