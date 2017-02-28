'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
	github: {
		id: String,
		displayName: String,
		username: String,
	},
	activities: [String]
}, { collection: 'userinfo' });

module.exports = mongoose.model('User', User);
