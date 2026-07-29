const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const Event = require('../models/Event');

// @desc Create a new event (organizer)
// @route POST /api/events
// @access Private/Organizer
const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    venue,
    address,
    startDate,
    endDate,
    price,
    seatingType,
    capacity,
    rows,
    cols,
  } = req.body;

  if (!title || !description || !venue || !startDate || !endDate) {
    res.status(400);
    throw new Error('Missing required event fields');
  }

  const event = new Event({
    title,
    description,
    category,
    venue,
    address,
    startDate,
    endDate,
    price: Number(price) || 0,
    organizer: req.user._id,
    seatingType: seatingType === 'assigned' ? 'assigned' : 'general',
    capacity: Number(capacity) || 0,
  });

  if (event.seatingType === 'assigned') {
    const r = Number(rows) || 1;
    const c = Number(cols) || Number(capacity) || 1;
    event.generateSeatMap(r, c);
  }

  if (req.file) {
    event.flyer = {
      url: `/uploads/flyers/${req.file.filename}`,
      publicId: req.file.filename,
    };
  }

  const created = await event.save();
  res.status(201).json({ success: true, data: created });
});

// @desc Get all approved & non-cancelled events (public listing) with optional filters
// @route GET /api/events
// @access Public
const getEvents = asyncHandler(async (req, res) => {
  const { category, search, upcoming } = req.query;

  const query = { status: 'approved', isCancelled: false };

  if (category) query.category = category;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { venue: { $regex: search, $options: 'i' } },
    ];
  }
  if (upcoming === 'true') {
    query.startDate = { $gte: new Date() };
  }

  const events = await Event.find(query).populate('organizer', 'name email').sort({ startDate: 1 });
  res.json({ success: true, count: events.length, data: events });
});

// @desc Get single event by id
// @route GET /api/events/:id
// @access Public
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name email');
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  res.json({ success: true, data: event });
});

// @desc Get events created by the logged-in organizer
// @route GET /api/events/mine
// @access Private/Organizer
const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: events.length, data: events });
});

// @desc Update an event (organizer who owns it, only while pending/approved & not started)
// @route PUT /api/events/:id
// @access Private/Organizer
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this event');
  }

  const editableFields = ['title', 'description', 'category', 'venue', 'address', 'startDate', 'endDate', 'price'];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) event[field] = req.body[field];
  });

  if (req.file) {
    // remove old flyer file if present
    if (event.flyer && event.flyer.publicId) {
      const oldPath = path.join(__dirname, '..', 'uploads', 'flyers', event.flyer.publicId);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    event.flyer = { url: `/uploads/flyers/${req.file.filename}`, publicId: req.file.filename };
  }

  // Any substantive edit after approval sends it back for re-approval
  if (event.status === 'approved') {
    event.status = 'pending';
  }

  const updated = await event.save();
  res.json({ success: true, data: updated });
});

// @desc Cancel an event
// @route DELETE /api/events/:id
// @access Private/Organizer or Admin
const cancelEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to cancel this event');
  }
  event.isCancelled = true;
  await event.save();
  res.json({ success: true, message: 'Event cancelled' });
});

// ---- Admin actions ----

// @desc Get all pending events for admin review
// @route GET /api/events/admin/pending
// @access Private/Admin
const getPendingEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ status: 'pending' }).populate('organizer', 'name email').sort({ createdAt: 1 });
  res.json({ success: true, count: events.length, data: events });
});

// @desc Approve or reject an event
// @route PUT /api/events/admin/:id/review
// @access Private/Admin
const reviewEvent = asyncHandler(async (req, res) => {
  const { decision, reason } = req.body; // decision: 'approved' | 'rejected'
  if (!['approved', 'rejected'].includes(decision)) {
    res.status(400);
    throw new Error("decision must be 'approved' or 'rejected'");
  }

  const event = await Event.findById(req.params.id).populate('organizer', 'name email');
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  event.status = decision;
  event.rejectionReason = decision === 'rejected' ? reason || 'Not specified' : null;
  await event.save();

  // Fire-and-forget email notification to organizer
  const { sendEmail, eventStatusTemplate } = require('../utils/email');
  sendEmail({
    to: event.organizer.email,
    subject: `Your event "${event.title}" was ${decision}`,
    html: eventStatusTemplate({
      organizerName: event.organizer.name,
      eventTitle: event.title,
      status: decision,
      reason: event.rejectionReason,
    }),
  });

  res.json({ success: true, data: event });
});

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  getMyEvents,
  updateEvent,
  cancelEvent,
  getPendingEvents,
  reviewEvent,
};
