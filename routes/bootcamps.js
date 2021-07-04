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
  bootcampPhotoUpload,
} = require('../controllers/bootcamps')

const Bootcamp = require('../models/Bootcamp')
const advancedResults = require('../middleware/advancedResults')

// Include other resources routers
const courseRouter = require('./courses')

// Loader Express Router
const router = express.Router()

//  Protecting the route and authorize
const { protect, authorize } = require('../middleware/auth')

// re-route into other resource router
router.use('/:bootcampId/courses', courseRouter)

// Searching the routes With In Radius
router.route('/radius/:zipcode/:distance').get(getBootcampInRadius)

// Getting and Creating Course
router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp)

// Deleting and Updating the Bootcamps
router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload)

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp)

// Exporting the Router
module.exports = router
