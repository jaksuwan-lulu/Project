// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  UserID: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('User', UserSchema);
