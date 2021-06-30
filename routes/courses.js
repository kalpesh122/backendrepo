// Loading Express
const express = require('express')

// importing logic of all routes i.e controllers by destructuring
const { getCourses } = require('../controllers/courses')

// Loader Express Router
const router = express.Router({ mergeParams: true })

router.route('/').get(getCourses)

module.exports = router
