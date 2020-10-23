const mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var Long = mongoose.Types.Long;

const { Schema } = mongoose;

const sashok_infos = new Schema({
    linked_user_id: String,
    access_token: String,
    serverid: String
});


mongoose.model('sashok_infos', sashok_infos);