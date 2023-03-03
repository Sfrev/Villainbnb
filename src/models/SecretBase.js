const mongoose = require('../database');
const bcrypt = require('bcryptjs');

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
        select : false
    },
    cidade:{
        type: String, 
        required: true,
    },
    tecnologia: {
        type: String, 
        required: true
    }
});

SecretBaseSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.nomeFachada, 10);
    this.nomeFachada = hash;

    next();
});

const SecretBase = mongoose.model('SecretBase', SecretBaseSchema);

module.exports = SecretBase;