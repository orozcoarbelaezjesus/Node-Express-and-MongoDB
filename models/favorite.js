const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: "User"
    },
    dishes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            require: true,
            ref: "Dish"
        }
    ]
},{
    timestamps: true
});

var Favorites = mongoose.model("Favorites", favoriteSchema);

module.exports = Favorites;