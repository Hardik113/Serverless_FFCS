const mongoose = require('mongoose');

const { Schema } = mongoose;

const facultyCourseSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
  },
  faculty: {
    type: Schema.Types.ObjectId,
    ref: 'Faculty',
  },
  slot: {
    type: String,
  },
  venue: {
    type: String,
  },
  type: {
    type: String,
  },
  day: {
    type: Number,
  },
  seats: {
    type: Number,
  },
  start_time: {
    type: String,
  },
  end_time: {
    type: String,
  },
  credits: {
    type: Number,
  },
});

module.exports = mongoose.model('FacultyCourse', facultyCourseSchema, 'faculty_course');
