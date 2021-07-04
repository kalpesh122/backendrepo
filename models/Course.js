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
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
})

CourseSchema.statics.getAverageCost = async function (bootcampId) {
  // console.log('Calculating avg cost...'.blue)
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' },
      },
    },
  ])
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    })
  } catch (err) {
    console.log(err)
  }
}

// Call getAverageCost after save

CourseSchema.post('save', function () {
  this.constructor.getAverageCost(this.bootcamp)
})
// Call getAverageCost  before remove
CourseSchema.pre('remove', function () {
  this.constructor.getAverageCost(this.bootcamp)
})
module.exports = mongoose.model('Course', CourseSchema)
