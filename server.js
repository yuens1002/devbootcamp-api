const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimiter = require('express-rate-limit');
const cors = require('cors');
const cookieParser = require('cookie-parser');
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
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');

const app = express();

// body parser
app.use(express.json());

// use for cookie processing
app.use(cookieParser());

// dev logging middleware
if (process.env.NODE_ENV === 'development') {
  // checkout docs for various fn params
  app.use(morgan('dev'));
}

// allow file upload
app.use(fileupload());

// sanitization & security
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());

app.use(
  rateLimiter({
    windowMs: 10 * 60 * 1000, // 10mins
    max: 100,
  })
);

app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// mount routers
app.use('/api/v1/bootcamps', bootcampRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin/users', adminRoutes);
app.use('/api/v1/reviews', reviewRoutes);

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
