const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const { generateTicketQR, dataUrlToBuffer } = require('../utils/qrcode');
const { sendEmail, ticketConfirmationTemplate } = require('../utils/email');

const purchaseTicket = asyncHandler(async (req, res) => {
  const { eventId, seatLabel, quantity } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (event.status !== 'approved' || event.isCancelled) {
    res.status(400);
    throw new Error('This event is not open for ticket sales');
  }
  if (new Date(event.startDate) < new Date()) {
    res.status(400);
    throw new Error('This event has already started or ended');
  }

  let updatedEvent;
  let seatLabelAssigned = null;
  let ticketQuantity = 1;
  let pricePaid = event.price;

  if (event.seatingType === 'assigned') {
    if (!seatLabel) {
      res.status(400);
      throw new Error('seatLabel is required for events with assigned seating');
    }
    updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, seatMap: { $elemMatch: { label: seatLabel, status: 'available' } } },
      { $set: { 'seatMap.$[elem].status': 'booked' } },
      { arrayFilters: [{ 'elem.label': seatLabel, 'elem.status': 'available' }], new: true }
    );
    if (!updatedEvent) {
      res.status(409);
      throw new Error('That seat is no longer available. Please choose another.');
    }
    seatLabelAssigned = seatLabel;
  } else {
    ticketQuantity = Math.max(1, Number(quantity) || 1);
    pricePaid = event.price * ticketQuantity;
    updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, $expr: { $lte: [{ $add: ['$seatsBooked', ticketQuantity] }, '$capacity'] } },
      { $inc: { seatsBooked: ticketQuantity } },
      { new: true }
    );
    if (!updatedEvent) {
      res.status(409);
      throw new Error('Not enough seats available for the requested quantity');
    }
  }

  const ticket = await Ticket.create({
    event: event._id,
    user: req.user._id,
    seatLabel: seatLabelAssigned,
    quantity: ticketQuantity,
    pricePaid,
  });

  const qrDataUrl = await generateTicketQR(ticket.ticketCode);
  ticket.qrCode = qrDataUrl;
  await ticket.save();


  if (event.seatingType === 'assigned') {
    await Event.updateOne(
      { _id: eventId, 'seatMap.label': seatLabelAssigned },
      { $set: { 'seatMap.$.ticket': ticket._id } }
    );
  }

  sendEmail({
    to: req.user.email,
    subject: `Your ticket for ${event.title}`,
    html: ticketConfirmationTemplate({
      userName: req.user.name,
      eventTitle: event.title,
      venue: event.venue,
      startDate: event.startDate,
      seatLabel: seatLabelAssigned,
      ticketCode: ticket.ticketCode,
    }),
    attachments: [
      {
        filename: 'ticket-qr.png',
        content: dataUrlToBuffer(qrDataUrl),
        cid: 'ticketqr',
      },
    ],
  });

  res.status(201).json({ success: true, data: ticket });
});

const getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ user: req.user._id })
    .populate('event', 'title venue startDate endDate flyer')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: tickets.length, data: tickets });
});


const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate('event').populate('user', 'name email');
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }
  const isOwner = ticket.user._id.toString() === req.user._id.toString();
  const isOrganizer = ticket.event.organizer.toString() === req.user._id.toString();
  if (!isOwner && !isOrganizer && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this ticket');
  }
  res.json({ success: true, data: ticket });
});

const checkInTicket = asyncHandler(async (req, res) => {
  const { ticketCode } = req.body;
  if (!ticketCode) {
    res.status(400);
    throw new Error('ticketCode is required');
  }

  const ticket = await Ticket.findOne({ ticketCode }).populate('event').populate('user', 'name email');
  if (!ticket) {
    res.status(404);
    throw new Error('Invalid ticket - not found');
  }

  const isOrganizer = ticket.event.organizer.toString() === req.user._id.toString();
  if (!isOrganizer && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to check in tickets for this event');
  }

  if (ticket.status === 'cancelled') {
    res.status(400);
    throw new Error('This ticket has been cancelled');
  }
  if (ticket.status === 'checked_in') {
    return res.status(200).json({
      success: true,
      alreadyCheckedIn: true,
      message: `Ticket already checked in at ${ticket.checkedInAt}`,
      data: ticket,
    });
  }

  ticket.status = 'checked_in';
  ticket.checkedInAt = new Date();
  await ticket.save();

  res.json({ success: true, message: 'Attendance registered successfully', data: ticket });
});


const getEventTickets = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  const tickets = await Ticket.find({ event: event._id }).populate('user', 'name email').sort({ createdAt: -1 });
  res.json({ success: true, count: tickets.length, data: tickets });
});

module.exports = {
  purchaseTicket,
  getMyTickets,
  getTicketById,
  checkInTicket,
  getEventTickets,
};
