const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const { getAllContrats, downloadAllContratsPDF, downloadContratByID ,getMyContrats} = require('../controllers/contratController');

// Routes CLIENT

// GET - Télécharger MON contrat (CLIENT)
router.get('/my-contrat/:id/download', requireAuth, downloadContratByID);
router.get('/my-contrats', requireAuth, getMyContrats);
// Routes ADMIN

// GET - Télécharger PDF de tous les contrats (ADMIN)
router.get('/download-pdf', requireAuth, requireRole(['admin']), downloadAllContratsPDF);

// GET - Voir tous les contrats (ADMIN)
router.get('/', requireAuth, requireRole(['admin']), getAllContrats);

module.exports = router;
