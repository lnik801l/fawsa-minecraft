const mongoose = require('mongoose');

const { Schema } = mongoose;

const CartShema = new Schema({
    linked_user_id: String,
    linked_projectname: String,
    linked_servername: String,
    items: {
        type: Array,
        default: []
    },
    bought_items: {
        type: Array,
        default: []
    }
});


CartShema.methods.addItems = function(item, cart) {
    var newCartItems = this.items;
    for (i in item) {
        if (item[i].count)
            newCartItems[i] = item[i];
        else
            console.log("corrupted item!");
    }
    cart.updateOne({ items: newCartItems });
};


mongoose.model('Carts', CartShema);