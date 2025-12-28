const mongoose = require('mongoose');

const contratSchema = new mongoose.Schema(
    {
        contractNumber: {
            type: String,
            required: [true, "Contract number is required"],
            unique: true,
        },
        startDate: {
            type: Date,
            required: [true, "Start date is required"], 
        },
        endDate: {
            type: Date,
            required: [true, "End date is required"],
        },
        reservation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reservation',
            required: [true, "Reservation reference is required"],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "User reference is required"],
        },
    },
    { timestamps: true }
);

const Contrat = mongoose.model('Contrat', contratSchema);

module.exports = Contrat;