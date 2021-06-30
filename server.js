// Loading the  files
const express = require('express')
const dotenv = require('dotenv')
const logger = require('./middleware/logger')
const morgan = require('morgan')
const colors = require('colors')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/error')
//Loading  env vars
dotenv.config({ path: './config/config.env' })

// connecting to the database
connectDB()

//Route files
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')

// app var
const app = express()

//Body Parser
app.use(express.json())

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Mount Routers
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)

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
  server.close(() => process.exit(1))
})
