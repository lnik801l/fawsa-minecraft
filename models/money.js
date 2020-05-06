const mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var Long = mongoose.Types.Long;

const { Schema } = mongoose;

const MoneyShema = new Schema({
    linked_user_id: String,
    donated_total: {
        type: Number,
        default: 0
    },
    project: String,
    money: {
        type: Long,
        default: 0
    },
    votes: {
        type: Number,
        default: 0
    }
});


mongoose.model('Money', MoneyShema);