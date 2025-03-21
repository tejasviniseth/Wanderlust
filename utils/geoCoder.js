const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap'
  // Optionally add other options here
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
