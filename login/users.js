const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
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
  course_taken: {
    type: Array,
    default: [],
  },
  credits_total: {
    type: Number,
  },
});

module.exports = mongoose.model('Users', userSchema);
