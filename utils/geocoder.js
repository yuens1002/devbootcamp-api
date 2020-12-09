const nodeGeoCoder = require('node-geocoder');
const provider = process.env.GEOCODER_PROVIDER;
const apiKey = process.env.GEOCODER_API_KEY;

const options = {
  provider,
  apiKey,
  formatter: null,
};

const geocoder = nodeGeoCoder(options);

module.exports = geocoder;
