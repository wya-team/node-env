const _ = require('lodash');
const { Avatar } = require('../models');

module.exports = class AvatarProxy {
	static get(uid) {
		return Avatar.findOne({ uid });
	}

	static up(uid, basecode, type) {
		return Avatar.update(
			{
				uid
			},
			{
				type,
				basecode
			},
			{
				upsert: true
			}
		);
	}
};
