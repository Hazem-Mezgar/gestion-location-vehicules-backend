const mongoose = require('mongoose');
const carschema = new mongoose.Schema(
    {
    plate:{
        type:String,
        required:[true,"Plate number is required"],
        unique:true,
    },
    brand:{
        type: String,
        required:[true,"Brand car is required"],
    },
    description:{
        type:String,
        required:[true,"Description is required"],
    },
    pricePerday:{
        type:Number,
        required:[true,"Price per day is required"],
    },
    imageUrl:{
        type:String,
        required:[true,"Image URL is required"],
    },
    available:{
        type:Boolean,
        default:true,
    },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
}
)
// Crée un modèle Mongoose "Car" basé sur le schéma carschema
// Permet d'effectuer des opérations CRUD (Create, Read, Update, Delete) sur la collection MongoDB "cars"
const Car = mongoose.model("Car", carschema);
// Exporte le modèle Car pour l'utiliser dans d'autres fichiers (routes, contrôleurs, etc.)
// Permet d'importer le modèle avec: const Car = require('./models/car');
module.exports= Car;