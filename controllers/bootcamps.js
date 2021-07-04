const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const path = require('path')

// @desc Get All Bootcamps
// @route  Get /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

// @desc Get single Bootcamp
// @route  Get /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404),
    )
  }
  res.status(200).json({ success: true, data: bootcamp })
})

// @desc Create Bootcamp
// @route  POST /api/v1/bootcamps
// @access Private (User Must be logged in)
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id

  // Check for Published Bootcamps
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id })
  // if the user is not an admin they can add only one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with id ${req.user.id} has already published a bootcamp`,
      ),
    )
  }
  const bootcamp = await Bootcamp.create(req.body)

  res.status(201).json({
    success: true,
    data: bootcamp,
  })
})

// @desc Update Bootcamp
// @route  PUT /api/v1/bootcamps/:id
// @access Private (User Must be logged in)
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)
  // Check bootcamp exists
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404),
    )
  }
  // Make sure user is bootcamp owner
  if (!bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this bootcamp`,
        401,
      ),
    )
  }

  bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({ success: true, data: bootcamp })
})

// @desc Delete Bootcamp
// @route  Delete /api/v1/bootcamps/:id
// @access Private (User Must be logged in)
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `${req.params.id} is unauthorized to delete the bootcamp`,
        401,
      ),
    )
  }
  bootcamp.remove()

  res.status(200).json({ success: true, data: {} })
})

////////

// @desc get Bootcamps within a radius
// @route  Delete /api/v1/bootcamps/radius/:zipcode/:distance
// @access Private (User Must be logged in)
exports.getBootcampInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params

  // Get lat/lan  from geocoder
  const loc = await geocoder.geocode(zipcode)
  const lat = loc[0].latitude
  const lng = loc[0].longitude

  //Calc radius using Radius
  //Divide Distance by radius of earth
  // Earth Radius is 3,963 mi/ 6378 km
  const radius = distance / 3963

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  })
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  })
})

// @desc Upload photo for bootcamp
// @route  put /api/v1/bootcamps/:id/photo
// @access Private (User Must be logged in)
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404),
    )
  }
  // Make sure user is bootcamp owner
  if (!bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this bootcamp`,
        401,
      ),
    )
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file `, 400))
  }
  // console.log(req.files)

  const file = req.files.file
  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file `, 400))
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload a image less than ${process.env.MAX_FILE_UPLOAD} `,
        400,
      ),
    )
  }
  // Create custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      return next(new ErrorResponse(`Problem with file Upload `, 500))
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })
  })

  //  console.log(file.name)
  res.status(200).json({
    success: true,
    data: file.name,
  })
})
