const Bootcamp = require('../models/Bootcamp')
// @desc Get All Bootcamps
// @route  Get /api/v1/bootcamps
// @access Public
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find()
    res.status(200).json({ success: true, data: bootcamps })
  } catch (err) {
    res.status(400).json({ success: false })
  }
}

// @desc Get single Bootcamp
// @route  Get /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
      return res.status(400).json({ success: true, data: bootcamp })
    }
    res.status(200).json({ success: true, data: bootcamp })
  } catch (err) {
    res.status(400).json({ success: false })
  }
}

// @desc Create Bootcamp
// @route  POST /api/v1/bootcamps
// @access Private (User Must be logged in)
exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body)
    res.status(201).json({
      success: true,
      data: bootcamp,
    })
  } catch (err) {
    res.status(400).json({ success: false })
  }
}

// @desc Update Bootcamp
// @route  PUT /api/v1/bootcamps/:id
// @access Private (User Must be logged in)
exports.updateBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Updated bootcamp ${req.params.id}` })
}

// @desc Delete Bootcamp
// @route  Delete /api/v1/bootcamps/:id
// @access Private (User Must be logged in)
exports.deleteBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Delete the  bootcamp ${req.params.id}` })
}
