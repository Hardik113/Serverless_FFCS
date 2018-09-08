const mongoose = require('mongoose');

const { Schema } = mongoose;

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  venue: {
    type: String,
    required: true,
  },
  start_time: {
    type: String,
    required: true,
  },
  end_time: {
    type: String,
    required: true,
  },
  slot: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
});

const userSchema = new mongoose.Schema({
  registration_number: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profile_image: {
    type: String,
    required: true,
  },
  school_code: {
    type: String,
    required: true,
  },
  current_year: {
    type: Number,
  },
  course_taken: [courseSchema],
  credits_total: {
    type: Number,
  },
});

module.exports = mongoose.model('Users', userSchema, 'users');
