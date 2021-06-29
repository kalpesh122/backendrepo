const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')

// @desc Get All Bootcamps
// @route  Get /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query
  let queryStr = JSON.stringify(req.query)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`)

  query = Bootcamp.find(JSON.parse(queryStr))

  const bootcamps = await query

  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps })
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
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404),
    )
  }

  res.status(200).json({ success: true, data: bootcamp })
})

// @desc Delete Bootcamp
// @route  Delete /api/v1/bootcamps/:id
// @access Private (User Must be logged in)
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404),
    )
  }

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
