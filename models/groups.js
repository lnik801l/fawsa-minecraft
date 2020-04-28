const mongoose = require('mongoose');

const { Schema } = mongoose;

const groups = new Schema({
  name: String,
  lp_name: String,
  project: String,
  expires_in_days: Number,
  icon_url: String,
  cost: Number
});

mongoose.model('Groups', groups);