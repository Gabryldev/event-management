const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  getMyEvents,
  updateEvent,
  cancelEvent,
  getPendingEvents,
  reviewEvent,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Admin routes (declared before /:id to avoid route collisions)
router.get('/admin/pending', protect, authorize('admin'), getPendingEvents);
router.put('/admin/:id/review', protect, authorize('admin'), reviewEvent);

router.get('/mine', protect, authorize('organizer', 'admin'), getMyEvents);

router.route('/').get(getEvents).post(protect, authorize('organizer', 'admin'), upload.single('flyer'), createEvent);

router
  .route('/:id')
  .get(getEventById)
  .put(protect, authorize('organizer', 'admin'), upload.single('flyer'), updateEvent)
  .delete(protect, authorize('organizer', 'admin'), cancelEvent);

module.exports = router;
