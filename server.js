// Loading the  files
const express = require('express')
const dotenv = require('dotenv')
const logger = require('./middleware/logger')
const morgan = require('morgan')
const colors = require('colors')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/error')
const fileupload = require('express-fileupload')
const path = require('path')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')

//Loading  env vars
dotenv.config({ path: './config/config.env' })

// connecting to the database
connectDB()

//Route files
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')
const users = require('./routes/users')
const reviews = require('./routes/reviews')

// app var
const app = express()

//Body Parser
app.use(express.json())

// Cookie Parser
app.use(cookieParser())

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// file upload
app.use(fileupload())

// santize data
app.use(mongoSanitize())

// xss attck prevention
app.use(xss())

// set security headers
app.use(helmet())

// rate limiting
const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 100 }) // 10 mins
app.use(limiter)

// prevent http param pollution
app.use(hpp())

// Enable cors
app.use(cors())

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))
// Mount Routers
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use('/api/v1/auth', auth)
app.use('/api/v1/users', users)
app.use('/api/v1/reviews', reviews)

app.use(errorHandler)

////////////////////////////////

// port var connected to environment var
const PORT = process.env.PORT || 5000

// Listesning at Given Port
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on  port ${PORT}`.yellow
      .bold,
  ),
)

// Handling unhandle promise rejection

process.on('unhandledRejection', (err, promise) => {
  console.log(`UnHandled Rejection Error:${err.message}`.red)
  // Close Server and exit process
  //server.close(() => process.exit(1))
})
