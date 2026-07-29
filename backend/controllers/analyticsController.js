const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

// @desc Analytics for a single event (organizer)
// @route GET /api/analytics/event/:eventId
// @access Private/Organizer
const getEventAnalytics = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const tickets = await Ticket.find({
    event: event._id
  });

  const totalTicketsSold = tickets.reduce((sum, t) => sum + (t.quantity || 1), 0);
  const revenue = tickets.reduce((sum, t) => sum + t.pricePaid, 0);
  const checkedIn = tickets.filter((t) => t.status === 'checked_in').length;
  const cancelled = tickets.filter((t) => t.status === 'cancelled').length;
  const activeTickets = tickets.filter(
    (t) => t.status !== "cancelled"
  );

  const attendanceRate = activeTickets.length ?
    Math.round((checkedIn / activeTickets.length) * 100) :
    0;
const occupancyRate = event.capacity
  ? Math.round((totalTicketsSold / event.capacity) * 100)
  : 0;
  // Sales over time (by day)
  const salesByDay = {};
  tickets.forEach((t) => {
    const day = t.createdAt.toISOString().slice(0, 10);
    salesByDay[day] = (salesByDay[day] || 0) + (t.quantity || 1);
  });

  res.json({
    success: true,
    data: {
      eventId: event._id,
      title: event.title,
      capacity: event.capacity,
      seatsAvailable: event.seatsAvailable,
      totalTicketsSold,
      revenue,
      checkedIn,
      occupancyRate,
      cancelled,
      attendanceRate,
      salesByDay,
    },
  });
});

const getOrganizerAnalytics = asyncHandler(async (req, res) => {
  const events = await Event.find({
    organizer: req.user._id
  });
  const eventIds = events.map((e) => e._id);
  const tickets = await Ticket.find({
    event: {
      $in: eventIds
    }
  });

  const revenue = tickets
    .filter((t) => t.status !== "cancelled")
    .reduce((sum, t) => sum + t.pricePaid, 0);
  const totalTicketsSold = tickets.reduce((sum, t) => sum + (t.quantity || 1), 0);

  const perEvent = events.map((event) => {
    const evTickets = tickets.filter((t) => t.event.toString() === event._id.toString());
    return {
      eventId: event._id,
      title: event.title,
      status: event.status,
      ticketsSold: evTickets.reduce((sum, t) => sum + (t.quantity || 1), 0),
      revenue: evTickets.reduce((sum, t) => sum + t.pricePaid, 0),
    };
  });

  res.json({
    success: true,
    data: {
      totalEvents: events.length,
      totalTicketsSold,
      totalRevenue: revenue,
      events: perEvent,
    },
  });
});

// @desc Platform-wide analytics (admin)
// @route GET /api/analytics/admin
// @access Private/Admin
const getAdminAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, totalOrganizers, totalEvents, pendingEvents, approvedEvents, totalTickets] = await Promise.all([
    User.countDocuments({
      role: 'user'
    }),
    User.countDocuments({
      role: 'organizer'
    }),
    Event.countDocuments(),
    Event.countDocuments({
      status: 'pending'
    }),
    Event.countDocuments({
      status: 'approved'
    }),
    Ticket.countDocuments(),
  ]);

  const revenueAgg = await Ticket.aggregate([{
    $group: {
      _id: null,
      total: {
        $sum: '$pricePaid'
      }
    }
  }]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  res.json({
    success: true,
    data: {
      totalUsers,
      totalOrganizers,
      totalEvents,
      pendingEvents,
      approvedEvents,
      totalTickets,
      totalRevenue,
    },
  });
});

module.exports = {
  getEventAnalytics,
  getOrganizerAnalytics,
  getAdminAnalytics
};