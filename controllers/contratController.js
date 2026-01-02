
const asyncHandler = require('express-async-handler');
const Contrat = require('../models/Contrat');
const PDFDocument = require('pdfkit');

// @desc    Get all contrats
// @route   GET /api/contrats
// @access  Private/Admin
const getAllContrats = asyncHandler(async (req, res) => {
  const contrats = await Contrat.find({})
    .populate({
      path: 'reservation',
      populate: { path: 'car' }
    })
    .populate('user')
    .sort({ createdAt: -1 });

  res.status(200).json(contrats);
});

// @desc    Download all contrats as PDF
// @route   GET /api/contrats/download-pdf
// @access  Private/Admin
const downloadContratsPDF = asyncHandler(async (req, res) => {
  const contrats = await Contrat.find({})
    .populate({
      path: 'reservation',
      populate: { path: 'car' }
    })
    .populate('user')
    .sort({ createdAt: -1 });

  // Créer un PDF
  const doc = new PDFDocument();
  
  // Set headers pour télécharger
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=contrats.pdf');
  
  // Pipe le PDF vers la réponse
  doc.pipe(res);
  
  // Titre
  doc.fontSize(20).text('Liste des Contrats', { align: 'center' });
  doc.moveDown();
  
  // Pour chaque contrat
  contrats.forEach((contrat, index) => {
    doc.fontSize(12).text(`Contrat #${index + 1}`, { underline: true });
    doc.fontSize(10);
    doc.text(`Numéro de contrat: ${contrat.contractNumber || 'N/A'}`);
    doc.text(`Client: ${contrat.user?.firstName || ''} ${contrat.user?.lastName || 'N/A'}`);
    doc.text(`Email: ${contrat.user?.email || 'N/A'}`);
    doc.text(`CIN: ${contrat.user?.identityCardNumber || 'N/A'}`);
    doc.text(`Réservation ID: ${contrat.reservation?._id || 'N/A'}`);
    doc.text(`Voiture: ${contrat.reservation?.car?.brand || 'N/A'} - ${contrat.reservation?.car?.plate || 'N/A'}`);
    doc.text(`Date début: ${contrat.startDate ? new Date(contrat.startDate).toLocaleDateString() : 'N/A'}`);
    doc.text(`Date fin: ${contrat.endDate ? new Date(contrat.endDate).toLocaleDateString() : 'N/A'}`);
    doc.text(`Date création: ${new Date(contrat.createdAt).toLocaleDateString()}`);
    doc.moveDown();
  });
  
  // Finaliser le PDF
  doc.end();
});

// @desc    Download MY contrat as PDF (CLIENT)
// @route   GET /api/contrats/my-contrat/:id/download
// @access  Private
const downloadMyContratPDF = asyncHandler(async (req, res) => {
  const userId = req.user.userId || req.user.id || req.user._id;
  
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

  // Vérifier que c'est son contrat
  const ownerId = (contrat.user && contrat.user._id) 
  ? contrat.user._id.toString() 
  : (contrat.user ? contrat.user.toString() : null);

  if (!ownerId || ownerId !== userId.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  // Créer le PDF
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=contrat-${contrat._id}.pdf`);
  doc.pipe(res);

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
  
  doc.end();
});

module.exports = {
  getAllContrats,
  downloadContratsPDF,
  downloadMyContratPDF
};
