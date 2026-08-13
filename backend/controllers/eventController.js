const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const Event = require('../models/Event');

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


const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name email');
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  res.json({ success: true, data: event });
});

const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: events.length, data: events });
});

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
   
    if (event.flyer && event.flyer.publicId) {
      const oldPath = path.join(__dirname, '..', 'uploads', 'flyers', event.flyer.publicId);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    event.flyer = { url: `/uploads/flyers/${req.file.filename}`, publicId: req.file.filename };
  }


  if (event.status === 'approved') {
    event.status = 'pending';
  }

  const updated = await event.save();
  res.json({ success: true, data: updated });
});


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


const getPendingEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ status: 'pending' }).populate('organizer', 'name email').sort({ createdAt: 1 });
  res.json({ success: true, count: events.length, data: events });
});


const reviewEvent = asyncHandler(async (req, res) => {
  const { decision, reason } = req.body; 
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
