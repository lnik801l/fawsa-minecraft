const mongoose = require('mongoose');
const cryptoRandomString = require('crypto-random-string');

const { Schema } = mongoose;

const EmailTokenShema = new Schema({
  linked_user_id: String,
  type: String,
  token: String
});

EmailTokenShema.methods.genToken = function() {
    return cryptoRandomString({length: 20, type: "url-safe"});
};

mongoose.model('EmailTokens', EmailTokenShema);