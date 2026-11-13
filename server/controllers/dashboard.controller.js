import User from '../models/User.js';
import ProductListing from '../models/ProductListing.js';
import Transaction from '../models/Transaction.js';
import GovernmentScheme from '../models/GovernmentScheme.js';

export async function getAdminStats(req, res, next) {
  try {
    const [users, farmers, buyers, activeListings, transactions, schemes] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'buyer' }),
      ProductListing.countDocuments({ status: 'active' }),
      Transaction.countDocuments(),
      GovernmentScheme.countDocuments(),
    ]);
    res.json({ success: true, stats: { users, farmers, buyers, activeListings, transactions, schemes } });
  } catch (error) { next(error); }
}
