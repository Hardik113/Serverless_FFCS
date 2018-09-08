const mongoose = require('mongoose');

const { Schema } = mongoose;

const facultySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Faculty', facultySchema, 'faculty');
