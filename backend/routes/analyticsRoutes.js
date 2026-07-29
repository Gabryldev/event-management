const express = require('express');
const router = express.Router();
const { getEventAnalytics, getOrganizerAnalytics, getAdminAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/event/:eventId', protect, authorize('organizer', 'admin'), getEventAnalytics);
router.get('/organizer', protect, authorize('organizer', 'admin'), getOrganizerAnalytics);
router.get('/admin', protect, authorize('admin'), getAdminAnalytics);

module.exports = router;
