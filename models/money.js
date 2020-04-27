const mongoose = require('mongoose');

const { Schema } = mongoose;

const MoneyShema = new Schema({
  linked_user_id: String,
  donated_total: Number,
  project: String,
  money: Number
});


mongoose.model('Money', MoneyShema);