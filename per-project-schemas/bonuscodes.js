const mongoose = require('mongoose');

const { Schema } = mongoose;

const CodesSchema = new Schema({

    expiry_date: Date,
    code: String,
    uses: Number,
    money: Number,
    uses_total: {
        type: Number,
        default: 0
    }

});


module.exports.schema = CodesSchema;