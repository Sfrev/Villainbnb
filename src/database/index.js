const mongoose = require('mongoose');

// Connect to database
mongoose.connect('mongodb://db:27017/villainbnb', {
    useNewUrlParser: true
}).then(() => {
    console.log('MongoDB Conectado');
}).catch(error => {
        console.log(error);
});;
mongoose.Promise = global.Promise;

module.exports = mongoose;
