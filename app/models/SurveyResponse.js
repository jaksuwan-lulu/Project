// backend/models/SurveyResponse.js
const mongoose = require('mongoose');

const SurveyResponseSchema = new mongoose.Schema({
  ScoreID: { type: String, required: true, unique: true },
  UserID: { type: String, required: true },
  scores: [Number], // Q1 to Q20
  totalScore: Number,
  stressLevel: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SurveyResponse', SurveyResponseSchema);
