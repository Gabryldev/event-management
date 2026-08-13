const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, 
    status: {
      type: String,
      enum: ['available', 'reserved', 'booked'],
      default: 'available',
    },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', default: null },
  
    reservedUntil: { type: Date, default: null },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, default: 'General' },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    venue: { type: String, required: true },
    address: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    flyer: {
      url: { type: String, default: null },
      publicId: { type: String, default: null }, 
    },

    price: { type: Number, required: true, default: 0 },

    
    seatingType: { type: String, enum: ['general', 'assigned'], default: 'general' },
    capacity: { type: Number, required: true }, 
    seatsBooked: { type: Number, default: 0 }, 
    seatMap: [seatSchema], 

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: null },

    isCancelled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

eventSchema.virtual('seatsAvailable').get(function () {
  if (this.seatingType === 'assigned') {
    return this.seatMap.filter((s) => s.status === 'available').length;
  }
  return this.capacity - this.seatsBooked;
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

eventSchema.virtual("seatsAvailable").get(function () {
  if (this.seatingType === "assigned") {
    return (this.seatMap || []).filter(
      (seat) => seat.status === "available"
    ).length;
  }

  return this.capacity - (this.seatsBooked || 0);
});
module.exports = mongoose.model('Event', eventSchema);
