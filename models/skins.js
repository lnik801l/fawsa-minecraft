const mongoose = require('mongoose');

const { Schema } = mongoose;

const SkinShema = new Schema({
    linked_uuid: String,
    linked_projectname: String,
    skin: String,
    cloak: String
});

/*
CartShema.methods.addItems = function(item, cart) {
    var newCartItems = this.items;
    for (i in item) {
        if (item[i].count)
            newCartItems[i] = item[i];
        else
            console.log("corrupted item!");
    }
    cart.updateOne({items: newCartItems});
};*/


mongoose.model('Skins', SkinShema);