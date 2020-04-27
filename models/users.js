const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid').v4;

const { Schema } = mongoose;

const UsersSchema = new Schema({
  username: String,
  activated: Number,
  money: Number,
  vk_id: String,
  email: String,
  uuid: String,
  hash: String,
  salt: String,
});

UsersSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UsersSchema.methods.validatePassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UsersSchema.methods.generateUUID = function() {
  var uuid = uuidv4();
  console.log(uuid);
  return this.uuid = uuid;
};

UsersSchema.methods.generateJWT = function() {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign({
    email: this.email,
    id: this._id,
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, 'secret');
}

UsersSchema.methods.toAuthJSON = function() {
  return {
    _id: this._id,
    email: this.email,
    username: this.username,
    uuid: this.uuid,
    money: this.money,
    activated: this.activated,
    token: this.generateJWT()
  };
};

UsersSchema.methods.toAuthJSONreg = function() {
  return {
    _id: this._id,
    email: this.email,
    username: this.username,
    uuid: this.uuid,
    money: this.money
  };
};

UsersSchema.methods.getUUID = function() {
  return this.uuid;
};

UsersSchema.methods.getUsername = function() {
  return this.username;
};

mongoose.model('Users', UsersSchema);