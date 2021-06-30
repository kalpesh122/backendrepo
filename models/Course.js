const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title'],
  },
  description: {
    type: String,
    required: [true, 'Please add a Description'],
  },
  weeks: {
    type: String,
    required: [true, 'Please add a Number of Weeks'],
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a Tuition Cost'],
  },

  minimumSkill: {
    type: String,
    required: [true, 'Please add a Minimum Skill'],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  scholarShipAvailable: {
    type: String,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
})

module.exports = mongoose.model('Course', CourseSchema)
