const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
	username: String,
	email: String,
	password: String,
	refreshToken: { type: String, default: null }
})

module.exports = mongoose.model("users", userSchema);