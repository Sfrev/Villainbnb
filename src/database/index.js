const mongoose = require('mongoose');

// Connect to database
mongoose.connect('mongodb://localhost/villainbnb');
mongoose.Promise = global.Promise;

module.exports = mongoose;
