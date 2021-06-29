// Loading Express
const express = require('express')

// importing logic of all routes i.e controllers by destructuring
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampInRadius,
} = require('../controllers/bootcamps')

// Loader Express Router
const router = express.Router()

router.route('/radius/:zipcode/:distance').get(getBootcampInRadius)
router.route('/').get(getBootcamps).post(createBootcamp)

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp)

// Exporting the Router
module.exports = router
