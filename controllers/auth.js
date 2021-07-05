const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const User = require('../models/User')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')

// @desc Register
// @route  Post /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body
  let user = await User.findOne({ email })
  if (!user) {
    //create user
    user = await User.create({
      name,
      email,
      password,
      role,
    })
  } else {
    return next(
      new ErrorResponse(`User ${name} with ${email} already registered `, 400),
    )
  }

  // Create a token
  sendTokenResponse(user, 200, res)
})
// @desc login
// @route  Post /api/v1/auth/register
// @access Public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body

  //create user
  // Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse('Please an  email and password', 400))
  }
  //    Check for user
  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 400))
  }

  //  check if pass matches
  const isMatch = await user.matchPassword(password)
  if (!isMatch) {
    return next(new ErrorResponse('Invalid Credentials', 401))
  }

  // Create a token
  sendTokenResponse(user, 200, res)
})

// @desc Get current logged out user
// @route  Post /api/v1/auth/register
// @access Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc Get current logged in user
// @route  Post /api/v1/auth/register
// @access Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc forgot password
// @route  Post /api/v1/auth/forgotpassword
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return next(new ErrorResponse(`There is no user with that email`, 404))
  }

  //Get reset token

  const resetToken = user.getResetPasswordToken()

  // console.log(resetToken)
  await user.save({ validateBeforeSave: false })

  // create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/auth/resetpassword/${resetToken}`

  const message = `You are receiving this email because you (or someone esle) has requested the reset of a password.Please make a put request to:\n\n ${resetUrl}`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset',
      message,
    })
    res.status(200).json({ success: true, data: 'Email sent' })
  } catch (err) {
    console.log(err)
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save({ validateBeforeSave: false })
    return next(new ErrorResponse('Email could not be sent', 500))
  }

  // res.status(200).json({
  //   success: true,
  //   data: user,
  // })
})

// @desc Reset Password
// @route  Put /api/v1/auth/resetPassword/:resetToken
// @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400))
  }

  // Set new Password
  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  // Create a token
  sendTokenResponse(user, 200, res)
})

// @desc Update
// @route  Put /api/v1/auth/update
// @access Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  }
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc Update Password
// @route  Post /api/v1/auth/password
// @access Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password')

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401))
  }
  user.password = req.body.newPassword
  await user.save()

  // Create a token
  sendTokenResponse(user, 200, res)
})

// Get token from Model create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create a token
  const token = user.getSignedJwtToken()
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  }

  if (process.env.NODE_ENV === 'production') {
    options.secure = true
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  })
}
