const express = require('express');
const router = express.Router();
const {
  createReservation,
  getAllReservations,
  getMyReservations,
  getReservationById,
  updateReservationStatus,
  deleteReservation,
  searchReservationByClientName,
  getReservationHistory
} = require('../controllers/reservationController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');


// Routes PROTÉGÉES (authentification requise)

// POST - Créer une réservation (CLIENT + ADMIN)
router.post('/', requireAuth, createReservation);

// GET - Voir mes réservations (CLIENT + ADMIN)
router.get('/my-reservations', requireAuth, getMyReservations);

// GET - Voir l'historique avec filtre status (CLIENT + ADMIN)
router.get('/history', requireAuth, getReservationHistory);

// GET - Consulter UNE réservation par ID (CLIENT + ADMIN)
router.get('/:id', requireAuth, getReservationById);


// Routes PROTÉGÉES pour ADMIN seulement

// GET - Voir toutes les réservations (ADMIN)
router.get('/', requireAuth, requireRole(['admin']), getAllReservations);

// GET - Rechercher par nom du client (ADMIN)
router.get('/search/client', requireAuth, requireRole(['admin']), searchReservationByClientName);

// PATCH - Accepter/Refuser une réservation (ADMIN)
router.patch('/:id', requireAuth, requireRole(['admin']), updateReservationStatus);

// DELETE - Supprimer une réservation (ADMIN)
router.delete('/:id', requireAuth, requireRole(['admin']), deleteReservation);


module.exports = router;
