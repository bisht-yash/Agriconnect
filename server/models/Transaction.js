import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductListing',
    required: true
  },

  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    required: true
  },

  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  amount: {
    type: Number,
    required: true,
    min: 0
  },

  quantity: {
    type: Number,
    required: true,
    min: 0
  },

  status: {
    type: String,
    enum: ['accepted', 'fulfilled', 'cancelled'],
    default: 'accepted',
    index: true
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'buyer_marked_paid', 'paid'],
    default: 'pending',
    index: true
  }

}, { timestamps: true });

export default mongoose.model('Transaction', schema);