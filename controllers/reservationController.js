const asyncHandler = require('express-async-handler');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Car = require('../models/car');
const Contrat = require('../models/Contrat');


const createReservationLogic = async (data) => {
  const { car, startDate, endDate, price, userId } = data;

  // 1. Date Validations
  if (new Date(startDate) >= new Date(endDate)) {
    throw new Error("End date must be after start date");
  }

  // 2. Updated Overlap Check
  // We block the car if there is a reservation that is:
  // - 'confirmed' (Paid)
  // - 'accepted' (Admin said yes, waiting for user to pay)
  const overlappingReservation = await Reservation.findOne({
    car: car,
    status: { $in: ['accepted', 'confirmed'] }, 
    $or: [
      { startDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
      { endDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
      { 
        startDate: { $lte: new Date(startDate) },
        endDate: { $gte: new Date(endDate) }
      }
    ]
  });

  if (overlappingReservation) {
    throw new Error("Car is already booked or awaiting payment for these dates");
  }

  // 3. Create the Reservation as 'pending' so the admin can accept or refuse
  const reservation = await Reservation.create({
    user: userId,
    car,
    startDate,
    endDate,
    price,
    status: 'pending' 
  });

  return await reservation.populate(['car', 'user']);
};

// --- UPDATED ROUTE HANDLER ---
const createReservation = asyncHandler(async (req, res) => {
  const { car, startDate, endDate, price } = req.body;

  console.log("User from Request:", req.user);
  const userId = req.user.userId;

  if (!car || !startDate || !endDate || !price) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  try {
    const reservation = await createReservationLogic({ car, startDate, endDate, price, userId });
    res.status(201).json(reservation);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});


// @desc    Get all reservations (ADMIN)
// @route   GET /api/reservations
// @access  Private/Admin
const getAllReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({})
    .populate('car')
    .populate('user')
    .sort({ createdAt: -1 });

  res.status(200).json(reservations);
});


// @desc    Get my reservations (CLIENT)
// @route   GET /api/reservations/my-reservations
// @access  Private
const getMyReservations = asyncHandler(async (req, res) => {
  const userId = req.user.userId || req.user.id || req.user._id;

  const reservations = await Reservation.find({ user: userId })
    .populate('car')
    .populate('user')
    .sort({ createdAt: -1 });

  res.status(200).json(reservations);
});


// @desc    Get reservation by ID
// @route   GET /api/reservations/:id
// @access  Private
const getReservationById = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id)
    .populate('car')
    .populate('user');

  if (reservation) {
    res.status(200).json(reservation);
  } else {
    res.status(404);
    throw new Error("Reservation not found");
  }
});


// @desc    Update reservation status (ADMIN)
// @route   PATCH /api/reservations/:id
// @access  Private/Admin
const updateReservationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

if (!['pending', 'confirmed', 'canceled', 'completed'].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }
  const reservation = await Reservation.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate('car').populate('user');

  if (reservation) {

    res.status(200).json(reservation);
  } else {
    res.status(404);
    throw new Error("Reservation not found");
  }
});


// @desc    Delete a reservation (ADMIN)
// @route   DELETE /api/reservations/:id
// @access  Private/Admin
const deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (reservation) {
    await Reservation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Reservation removed" });
  } else {
    res.status(404);
    throw new Error("Reservation not found");
  }
});


// @desc    Search reservations by client name (ADMIN)
// @route   GET /api/reservations/search/client?firstName=...&lastName=...
// @access  Private/Admin
const searchReservationByClientName = asyncHandler(async (req, res) => {
  const { firstName, lastName } = req.query;

  if (!firstName && !lastName) {
    res.status(400);
    throw new Error("Please provide firstName or lastName");
  }

  const query = {};
  if (firstName) query.firstName = { $regex: firstName, $options: 'i' };
  if (lastName) query.lastName = { $regex: lastName, $options: 'i' };

  const users = await User.find(query);
  const userIds = users.map(u => u._id);

  const reservations = await Reservation.find({ user: { $in: userIds } })
    .populate('car')
    .populate('user')
    .sort({ createdAt: -1 });

  res.status(200).json(reservations);
});


// @desc    Get reservation history with status filter
// @route   GET /api/reservations/history?status=...
// @access  Private
const getReservationHistory = asyncHandler(async (req, res) => {
  const { status } = req.query;
 const userId = req.user.userId || req.user.id || req.user._id;

  const query = { user: userId };
  if (status) query.status = status;

  const reservations = await Reservation.find(query)
    .populate('car')
    .populate('user')
    .sort({ createdAt: -1 });

  res.status(200).json(reservations);
});


// Exportation des fonctions du contrôleur pour les utiliser dans les routes
module.exports = {
  createReservation,
  getAllReservations,
  getMyReservations,
  getReservationById,
  updateReservationStatus,
  deleteReservation,
  searchReservationByClientName,
  getReservationHistory
};