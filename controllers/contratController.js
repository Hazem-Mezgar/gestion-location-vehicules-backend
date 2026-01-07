const asyncHandler = require('express-async-handler');
const Contrat = require('../models/Contrat');
const PDFDocument = require('pdfkit');

// Helper function to generate the PDF layout
const generatePDFLayout = (doc, contrat) => {
  doc.fontSize(20).text('Contrat de Location', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Numéro de contrat: ${contrat.contractNumber || 'N/A'}`);
  doc.moveDown();
  doc.text(`Client: ${contrat.user?.firstName || ''} ${contrat.user?.lastName || 'N/A'}`);
  doc.text(`Email: ${contrat.user?.email || 'N/A'}`);
  doc.text(`CIN: ${contrat.user?.identityCardNumber || 'N/A'}`);
  doc.text(`Téléphone: ${contrat.user?.phoneNumber || 'N/A'}`);
  doc.moveDown();
  doc.text(`Réservation ID: ${contrat.reservation?._id || 'N/A'}`);
  doc.text(`Voiture: ${contrat.reservation?.car?.brand || 'N/A'} - ${contrat.reservation?.car?.plate || 'N/A'}`);
  doc.moveDown();
  doc.text(`Date début: ${contrat.startDate ? new Date(contrat.startDate).toLocaleDateString() : 'N/A'}`);
  doc.text(`Date fin: ${contrat.endDate ? new Date(contrat.endDate).toLocaleDateString() : 'N/A'}`);
  doc.text(`Date création: ${new Date(contrat.createdAt).toLocaleDateString()}`);
};

// @desc    Download a specific contract by ID (Admin can get any, User gets their own)
// @route   GET /api/contrats/:id/download
// @access  Private
const downloadContratByID = asyncHandler(async (req, res) => {
  const userId = req.user.userId || req.user.id || req.user._id;
  const isAdmin = req.user.role === 'admin';

  const contrat = await Contrat.findById(req.params.id)
    .populate({
      path: 'reservation',
      populate: { path: 'car' }
    })
    .populate('user');

  if (!contrat) {
    res.status(404);
    throw new Error("Contrat not found");
  }

  // PERMISSION CHECK
  const ownerId = contrat.user?._id.toString();
  
  // If not Admin AND the user is not the owner -> Deny access
  if (!isAdmin && ownerId !== userId.toString()) {
    res.status(403);
    throw new Error("Not authorized to access this contract");
  }

  // CREATE PDF
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=contrat-${contrat.contractNumber}.pdf`);
  
  doc.pipe(res);
  generatePDFLayout(doc, contrat);
  doc.end();
});

// @desc    Get all contrats (JSON metadata only)
// @route   GET /api/contrats
// @access  Private/Admin
const getAllContrats = asyncHandler(async (req, res) => {
  const contrats = await Contrat.find({})
    .populate({ path: 'reservation', populate: { path: 'car' } })
    .populate('user')
    .sort({ createdAt: -1 });

  res.status(200).json(contrats);
});

// @desc    Download all contrats in one PDF (ADMIN ONLY)
// @route   GET /api/contrats/download-all
// @access  Private/Admin
const downloadAllContratsPDF = asyncHandler(async (req, res) => {
  const contrats = await Contrat.find({})
    .populate({ path: 'reservation', populate: { path: 'car' } })
    .populate('user')
    .sort({ createdAt: -1 });

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=all-contrats.pdf');
  
  doc.pipe(res);
  doc.fontSize(22).text('Rapport Global des Contrats', { align: 'center' });
  doc.moveDown();

  contrats.forEach((contrat, index) => {
    if (index > 0) doc.addPage(); 
    generatePDFLayout(doc, contrat);
  });

  doc.end();
});



// @desc    Get all contracts for the logged-in user
// @route   GET /api/contrats/my-history
// @access  Private
const getMyContrats = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  // Find contracts where 'user' matches the logged-in user's ID
  const contrats = await Contrat.find({ user: userId })
    .populate({
      path: 'reservation',
      populate: { path: 'car' }
    })
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 });

  // Return empty array instead of 404 if no contracts yet (better for frontend)
  res.status(200).json(contrats || []);
});

module.exports = {
  getAllContrats,
  downloadContratByID,
  downloadAllContratsPDF,
  getMyContrats
};