const mongoose = require('mongoose');

const { Schema } = mongoose;

const luckperms_users = new Schema({
  name: String,
  primaryGroup: String,
  permissions: Array
});

mongoose.model('luckperms_users', luckperms_users);