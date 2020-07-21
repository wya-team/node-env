const _ = require('lodash');
const { User } = require('../models');
const ft = require('../models/_fields_table');
const { Utils } = require('../utils');

const gravatar = [];
const SELECT_FIELDS = ft.user.join(' ');

module.exports = class UserProxy {
	static newAndSave({ email, username, password }) {
		let user = new User({ email });

		user.username = username || email.substr(0, email.indexOf('@'));
		user.passsalt = Utils.randStr();
		user.password = Utils.generatePassword(password, user.passsalt);
		user.add_time = Utils.time();
		user.up_time = Utils.time();

		user.type = 'site';
		user.role = 'member';

		return user.save();
	}

	static update(id, data) {
		return User.updateOne({ _id: id }, data);
	}

	static checkRepeat(email) {
		return User.countDocuments({ email });
	}

	static findById(id) {
		return User.findById(id);
	}

	static findByEmail(email) {
		return User.findOne({ email });
	}

	static listWithPaging(page, limit) {
		page = parseInt(page, 10);
		limit = parseInt(limit, 10);
		return User
			.find()
			.sort({ _id: -1 })
			.skip((page - 1) * limit)
			.limit(limit)
			.select(SELECT_FIELDS)
			.exec();
	}

	static listCount() {
		return User.countDocuments();
	}
};
