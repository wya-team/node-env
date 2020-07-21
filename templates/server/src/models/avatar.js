const mongoose = require('mongoose');
const { createModel } = require('./_common');

const Schema = mongoose.Schema;

const schema = new Schema({
	uid: { type: Number, required: true },
	basecode: String,
	type: String
});

module.exports = createModel('avatar', schema);