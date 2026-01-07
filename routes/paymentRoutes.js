const express = require('express');
const router = express.Router();
const { processPayment, getMyPayments } = require('../controllers/paymentController');
const { requireAuth } = require('../middlewares/authMiddleware'); 

// All payment routes should be protected
router.use(requireAuth);


router.post('/checkout', processPayment);

// @route   GET /api/payments/my-history
// @desc    Get the payment history for the logged-in user
router.get('/my-history', getMyPayments);

module.exports = router;