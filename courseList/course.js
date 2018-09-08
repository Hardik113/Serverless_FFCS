const mongoose = require('mongoose');


const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  course_code: {
    type: String,
    required: true,
  },
  school_code: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['PC', 'PE', 'UE', 'UC'],
  },
  credit: [
    {
      label: {
        type: String,
        required: true,
      },
      number: {
        type: Number,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    enum: ['Filling Fast', 'Filled', 'Seats Left'],
  },
});

module.exports = mongoose.model('Course', courseSchema, 'course');
