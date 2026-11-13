import { Router } from 'express';

import { protect, authorize } from '../middleware/auth.middleware.js';

import { listingImageUpload } from '../middleware/upload.middleware.js';

import {
  listListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  createOffer,
  myOffers,
  acceptOffer,
  rejectOffer,
  markPaymentPaid,
  confirmPaymentReceived,
  listTransactions,
  getTransaction
} from '../controllers/marketplace.controller.js';

const r = Router();

r.get('/listings', listListings);
r.get('/listings/:id', getListing);

r.post(
  '/listings',
  protect,
  authorize('farmer'),
  listingImageUpload.single('image'),
  createListing
);

r.put(
  '/listings/:id',
  protect,
  authorize('farmer'),
  updateListing
);

r.delete(
  '/listings/:id',
  protect,
  authorize('farmer'),
  deleteListing
);

r.post(
  '/offers',
  protect,
  authorize('buyer'),
  createOffer
);

r.get(
  '/offers/my',
  protect,
  myOffers
);

r.patch(
  '/offers/:id/accept',
  protect,
  authorize('farmer'),
  acceptOffer
);

r.patch(
  '/offers/:id/reject',
  protect,
  authorize('farmer'),
  rejectOffer
);

// 💰 Buyer payment confirmation
r.patch(
  '/transactions/:id/payment',
  protect,
  authorize('buyer'),
  markPaymentPaid
);

r.patch(
  '/transactions/:id/payment/confirm',
  protect,
  authorize('farmer'),
  confirmPaymentReceived
);

r.get(
  '/transactions',
  protect,
  listTransactions
);

r.get(
  '/transactions/:id',
  protect,
  getTransaction
);

export default r;