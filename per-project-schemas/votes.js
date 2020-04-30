const mongoose = require('mongoose');

const { Schema } = mongoose;

const VotesSchema = new Schema({
    linked_user_id: String,
    votes: Number
});


module.exports.schema = VotesSchema;