const mongoose = require('mongoose');
const {
  v4: uuidv4
} = require('uuid');

const ticketSchema = new mongoose.Schema({
  ticketCode: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4()
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  seatLabel: {
    type: String,
    default: null
  }, 
  quantity: {
    type: Number,
    default: 1
  },

  pricePaid: {
    type: Number,
    required: true,
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },

  paymentReference: {
    type: String,
    default: null,
  },

  qrCode: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['booked', 'checked_in', 'cancelled'],
    default: 'booked',
  },
  checkedInAt: {
    type: Date,
    default: null
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);