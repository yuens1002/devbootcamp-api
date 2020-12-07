const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const colors = require('colors');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/database');
const path = require('path');

// load env w/ path to it
dotenv.config({ path: './config/config.env' });

// connect to mongo db
connectDB();

// routes
const bootcampRoutes = require('./routes/bootcamps');
const courseRoutes = require('./routes/courses');

const app = express();

// body parser
app.use(express.json());

// dev logging middleware
if (process.env.NODE_ENV === 'development') {
  // checkout docs for various fn params
  app.use(morgan('dev'));
}

// be sure to use this after mounting thr routers
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// mount routers
app.use('/api/v1/bootcamps', bootcampRoutes);
app.use('/api/v1/courses', courseRoutes);

// middlewares are in a linear fashion
app.use(errorHandler);

// set env port
const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});

// http://expressjs.com/en/starter/faq.html#how-do-i-handle-404-responses
app.use(function (req, res, next) {
  res.status(404).json('404 Page not found!');
});
