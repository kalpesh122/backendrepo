// Loading Express
const express = require('express')

// importing logic of all routes i.e controllers by destructuring
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses')

// Loader Express Router
const router = express.Router({ mergeParams: true })

router.route('/').get(getCourses).post(addCourse)

router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse)
module.exports = router
