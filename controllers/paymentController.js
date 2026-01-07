const asyncHandler = require("express-async-handler");
const Reservation = require("../models/Reservation");
const Payment = require("../models/Payment");
const Car = require("../models/car");
const Contrat = require("../models/Contrat");

// @desc    Process simulated payment and finalize reservation
// @route   POST /api/payments/checkout
// @access  Private (Requires Auth Middleware)
// controllers/paymentController.js

const processPayment = asyncHandler(async (req, res) => {
  const { reservationId, cardDetails } = req.body;

  // 1. Find the reservation first
  const reservation = await Reservation.findById(reservationId);

  if (!reservation) {
    res.status(404);
    throw new Error("Reservation not found");
  }

  // 2. Security Check: Only pay if Admin has accepted it
  if (reservation.status !== 'confirmed') {
    res.status(400);
    throw new Error("This reservation has not been accepted by the admin yet.");
  }

  // 3. Fake Payment Simulation
  const paymentStatus = cardDetails.cardNumber.startsWith("42"); 

  if (paymentStatus) {
    // 4. Update Reservation to 'confirmed' (Paid)
    reservation.status = 'completed';
    await reservation.save();

    // 5. Create Payment Receipt
    await Payment.create({
      reservation: reservation._id,
      user: req.user.userId,
      amount: reservation.price,
      status: 'completed',
      transactionId: `PAY-${Date.now()}`
    });

    // 6. NOW Create the Contract (since it's paid and confirmed)
    await Contrat.create({
      contractNumber: `CONT-${Date.now()}`,
      user: reservation.user,
      reservation: reservation._id,
      startDate: reservation.startDate,
      endDate: reservation.endDate
    });

    res.status(200).json({ message: "Paid successfully!", reservation });
  } else {
    res.status(400);
    throw new Error("Payment failed.");
  }
});

// @desc    Get user payment history
// @route   GET /api/payments/my-payments
const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user.userId}).populate('reservation');
  res.status(200).json(payments);
});

module.exports = {
  processPayment,
  getMyPayments
};