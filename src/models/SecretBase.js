const mongoose = require('../database');

const SecretBaseSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        unique: true
    },
    nomeFachada: {
        type: String, 
        required: true,
        unique: true,
    },
    cidade:{
        type: String, 
        required: true,
    },
    tecnologia: {
        type: String, 
        required: true
    },
    estaAlugada: {
        type: Boolean,
        required: true,
    },
});

const SecretBase = mongoose.model('SecretBase', SecretBaseSchema);

module.exports = SecretBase;