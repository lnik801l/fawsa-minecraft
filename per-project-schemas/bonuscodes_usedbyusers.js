const mongoose = require('mongoose');

const { Schema } = mongoose;

const bc_ubu = new Schema({

    linked_user_id: String,
    code: String

});


module.exports.schema = bc_ubu;