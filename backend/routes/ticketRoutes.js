const express = require('express');
const router = express.Router();
const {
  purchaseTicket,
  getMyTickets,
  getTicketById,
  checkInTicket,
  getEventTickets,
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');

router.post('/purchase', protect, authorize('user', 'organizer', 'admin'), purchaseTicket);
router.get('/mine', protect, getMyTickets);
router.post('/check-in', protect, authorize('organizer', 'admin'), checkInTicket);
router.get('/event/:eventId', protect, authorize('organizer', 'admin'), getEventTickets);
router.get('/:id', protect, getTicketById);

module.exports = router;
