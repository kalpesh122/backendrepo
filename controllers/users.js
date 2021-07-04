const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const User = require('../models/User')

// @desc get all users
// @route  Get /api/v1/auth/users
// @access Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

// @desc get all users
// @route  Get /api/v1/auth/users
// @access Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc create all users
// @route  Post /api/v1/auth/users
// @access Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body)
  res.status(201).json({
    success: true,
    data: user,
  })
})

// @desc update a user
// @route  Put /api/v1/auth/users
// @access Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  res.status(200).json({
    success: true,
    data: user,
  })
})
// @desc delete a user
// @route  delete /api/v1/auth/users
// @access Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id)
  res.status(200).json({
    success: true,
    data: user,
  })
})
