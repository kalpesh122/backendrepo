// Loading Express
const express = require('express')

// importing logic of all routes i.e controllers by destructuring
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/users')

const User = require('../models/User')
const advancedResults = require('../middleware/advancedResults')

// Loader Express Router
const router = express.Router({ mergeParams: true })
const { protect, authorize } = require('../middleware/auth')
router.use(protect)
router
  .use(authorize('admin'))
  .route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser)

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser)

module.exports = router
