const mongoose = require('mongoose');
const reservationSchema = new mongoose.Schema(
  {
   status: {
      type: String,
      enum: ['pending', 'confirmed', 'canceled', 'completed'],
        default: 'pending',
        required: true,
    },
    price:{
        type: Number,
        required: [true, "Price is required"],
    },
    startDate: {
        type: Date,
        required: [true, "Start date is required"],
    },
    endDate: {
        type: Date,
        required: [true, "End date is required"],
    },
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: [true, "Car reference is required"],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User reference is required"],
    },
  },
  { timestamps: true }
);
const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;