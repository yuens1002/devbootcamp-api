const app = require('express')();
const dotenv = require('dotenv');
const morgan = require('morgan');

// routes
const bootcampRoutes = require('./routes/bootcamps');

// load env w/ path to it
dotenv.config({ path: './config/config.env' });

// dev logging middleware
if (process.env.NODE_ENV === 'development') {
  // checkout docs for various fn params
  app.use(morgan('dev'));
}

// bootcamp methods
app.use('/api/v1/bootcamps', bootcampRoutes);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
