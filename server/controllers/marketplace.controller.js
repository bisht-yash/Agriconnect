import ProductListing from '../models/ProductListing.js';
import Offer from '../models/Offer.js';
import Transaction from '../models/Transaction.js';

export async function listListings(req, res, next) {
  try {
    const {
      q,
      crop,
      state,
      district,
      minPrice,
      maxPrice,
      status = 'active'
    } = req.query;

    const f = {};

    if (status) f.status = status;

    if (crop) {
      f.cropName = {
        $regex: String(crop),
        $options: 'i'
      };
    }

    if (q) {
      f.$or = [
        {
          cropName: {
            $regex: String(q),
            $options: 'i'
          }
        },
        {
          description: {
            $regex: String(q),
            $options: 'i'
          }
        }
      ];
    }

    if (state) {
      f['location.state'] = {
        $regex: String(state),
        $options: 'i'
      };
    }

    if (district) {
      f['location.district'] = {
        $regex: String(district),
        $options: 'i'
      };
    }

    if (minPrice || maxPrice) f.expectedPrice = {};
    if (minPrice) f.expectedPrice.$gte = Number(minPrice);
    if (maxPrice) f.expectedPrice.$lte = Number(maxPrice);

    const listings = await ProductListing
      .find(f)
      .populate('farmer', 'name state district phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json(listings);
  } catch (e) {
    next(e);
  }
}


export async function getListing(req, res, next) {
  try {
    const x = await ProductListing
      .findById(req.params.id)
      .populate(
        'farmer',
        'name email phone state district village'
      )
      .populate('crop', 'name')
      .lean();

    if (!x) {
      return res.status(404).json({
        message: 'Listing not found'
      });
    }

    res.json(x);
  } catch (e) {
    next(e);
  }
}


export async function createListing(req, res, next) {
  try {
    const {
      crop,
      cropName,
      quantity,
      unit,
      expectedPrice,
      state,
      district,
      harvestDate,
      description,
      qualityGrade,
      contactPhone,
      imageUrl
    } = req.body;

    if (
      !cropName ||
      !Number.isFinite(Number(quantity)) ||
      Number(quantity) <= 0 ||
      !Number.isFinite(Number(expectedPrice)) ||
      Number(expectedPrice) < 0
    ) {
      return res.status(400).json({
        message: 'Crop name, positive quantity and valid price are required'
      });
    }

    const storedImageUrl = req.file
      ? `${process.env.SERVER_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`}/uploads/${req.file.filename}`
      : imageUrl;

    const listing = await ProductListing.create({
      farmer: req.user._id,
      crop,
      cropName,
      quantity: Number(quantity),
      unit,
      expectedPrice: Number(expectedPrice),
      location: {
        state,
        district
      },
      harvestDate,
      description,
      qualityGrade,
      contactPhone: contactPhone || req.user.phone,
      imageUrl: storedImageUrl
    });

    res.status(201).json(
      await listing.populate(
        'farmer',
        'name state district phone'
      )
    );
  } catch (e) {
    next(e);
  }
}


export async function updateListing(req, res, next) {
  try {
    const listing = await ProductListing.findOne({
      _id: req.params.id,
      farmer: req.user._id
    });

    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found'
      });
    }

    if (listing.status !== 'active') {
      return res.status(409).json({
        message: 'Only active listings can be edited'
      });
    }

    Object.assign(listing, req.body);

    await listing.save();

    res.json(listing);
  } catch (e) {
    next(e);
  }
}


export async function deleteListing(req, res, next) {
  try {
    const listing = await ProductListing.findOne({
      _id: req.params.id,
      farmer: req.user._id
    });

    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found'
      });
    }

    listing.status = 'closed';

    await listing.save();

    res.json({
      message: 'Listing closed'
    });
  } catch (e) {
    next(e);
  }
}


export async function createOffer(req, res, next) {
  try {
    if (req.user.role !== 'buyer') {
      return res.status(403).json({
        message: 'Only buyers can submit offers'
      });
    }

    const {
      listing,
      offeredPrice,
      quantity,
      message
    } = req.body;

    const item = await ProductListing.findById(listing);

    if (!item || item.status !== 'active') {
      return res.status(404).json({
        message: 'Active listing not found'
      });
    }

    if (String(item.farmer) === String(req.user._id)) {
      return res.status(400).json({
        message: 'You cannot offer on your own listing'
      });
    }

    if (
      Number(quantity) <= 0 ||
      Number(quantity) > item.quantity ||
      Number(offeredPrice) < 0
    ) {
      return res.status(400).json({
        message: 'Invalid offer quantity or price'
      });
    }

    const existing = await Offer.findOne({
      listing,
      buyer: req.user._id,
      status: 'pending'
    });

    if (existing) {
      return res.status(409).json({
        message: 'You already have a pending offer for this listing'
      });
    }

    const offer = await Offer.create({
      listing,
      buyer: req.user._id,
      farmer: item.farmer,
      offeredPrice: Number(offeredPrice),
      quantity: Number(quantity),
      message
    });

    res.status(201).json(
      await offer.populate([
        {
          path: 'listing',
          select: 'cropName expectedPrice quantity unit'
        },
        {
          path: 'buyer',
          select: 'name email phone'
        }
      ])
    );
  } catch (e) {
    next(e);
  }
}


export async function myOffers(req, res, next) {
  try {
    const f =
      req.user.role === 'farmer'
        ? { farmer: req.user._id }
        : { buyer: req.user._id };

    const offers = await Offer
      .find(f)
      .populate(
        'listing',
        'cropName quantity unit expectedPrice imageUrl location status'
      )
      .populate('buyer', 'name email phone')
      .populate('farmer', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json(offers);
  } catch (e) {
    next(e);
  }
}


export async function acceptOffer(req, res, next) {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        message: 'Offer not found'
      });
    }

    if (String(offer.farmer) !== String(req.user._id)) {
      return res.status(403).json({
        message: 'Only the farmer can accept this offer'
      });
    }

    if (offer.status !== 'pending') {
      return res.status(409).json({
        message: 'Offer is no longer pending'
      });
    }

    const listing = await ProductListing.findOneAndUpdate(
      {
        _id: offer.listing,
        farmer: req.user._id,
        status: 'active',
        quantity: {
          $gte: offer.quantity
        }
      },
      {
        status: 'reserved'
      },
      {
        new: true
      }
    );

    if (!listing) {
      return res.status(409).json({
        message: 'Listing is no longer available or has insufficient quantity'
      });
    }

    offer.status = 'accepted';
    await offer.save();

    const tx = await Transaction.create({
      listing: listing._id,
      offer: offer._id,
      buyer: offer.buyer,
      farmer: offer.farmer,
      amount: offer.offeredPrice * offer.quantity,
      quantity: offer.quantity,

      // Payment starts as pending
      paymentStatus: 'pending'
    });

    res.json(
      await tx.populate([
        {
          path: 'listing',
          select: 'cropName quantity unit location imageUrl'
        },
        {
          path: 'buyer',
          select: 'name email phone state district village'
        },
        {
          path: 'farmer',
          select: 'name email phone state district village'
        }
      ])
    );
  } catch (e) {
    next(e);
  }
}


export async function rejectOffer(req, res, next) {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        message: 'Offer not found'
      });
    }

    if (String(offer.farmer) !== String(req.user._id)) {
      return res.status(403).json({
        message: 'Only the farmer can reject this offer'
      });
    }

    if (offer.status !== 'pending') {
      return res.status(409).json({
        message: 'Offer is no longer pending'
      });
    }

    offer.status = 'rejected';

    await offer.save();

    res.json(offer);
  } catch (e) {
    next(e);
  }
}


/*
|--------------------------------------------------------------------------
| BUYER MARKS PAYMENT AS PAID
|--------------------------------------------------------------------------
*/

export async function markPaymentPaid(req, res, next) {
  try {
    const tx = await Transaction.findById(req.params.id);

    if (!tx) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    // Only buyer can submit payment claim
    if (String(tx.buyer) !== String(req.user._id)) {
      return res.status(403).json({
        message: 'Only the buyer can mark payment as paid'
      });
    }

    if (tx.status !== 'accepted') {
      return res.status(409).json({
        message: 'This transaction is not active'
      });
    }

    if (tx.paymentStatus === 'paid') {
      return res.status(409).json({
        message: 'Payment is already confirmed'
      });
    }

    if (tx.paymentStatus === 'buyer_marked_paid') {
      return res.status(409).json({
        message: 'Payment is already submitted and waiting for farmer confirmation'
      });
    }

    tx.paymentStatus = 'buyer_marked_paid';

    await tx.save();

    const updated = await Transaction
      .findById(tx._id)
      .populate(
        'listing',
        'cropName quantity unit location imageUrl'
      )
      .populate(
        'buyer',
        'name email phone state district village'
      )
      .populate(
        'farmer',
        'name email phone state district village'
      )
      .lean();

    res.json(updated);
  } catch (e) {
    next(e);
  }
}

export async function confirmPaymentReceived(req, res, next) {
  try {
    const tx = await Transaction.findById(req.params.id);

    if (!tx) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    // Only farmer can confirm received payment
    if (String(tx.farmer) !== String(req.user._id)) {
      return res.status(403).json({
        message: 'Only the farmer can confirm payment received'
      });
    }

    if (tx.status !== 'accepted') {
      return res.status(409).json({
        message: 'This transaction is not active'
      });
    }

    // Buyer must first submit payment claim
    if (tx.paymentStatus !== 'buyer_marked_paid') {
      return res.status(409).json({
        message: 'Buyer has not marked the payment as paid yet'
      });
    }

    tx.paymentStatus = 'paid';

    await tx.save();

    const updated = await Transaction
      .findById(tx._id)
      .populate(
        'listing',
        'cropName quantity unit location imageUrl'
      )
      .populate(
        'buyer',
        'name email phone state district village'
      )
      .populate(
        'farmer',
        'name email phone state district village'
      )
      .lean();

    res.json(updated);
  } catch (e) {
    next(e);
  }
}


export async function listTransactions(req, res, next) {
  try {
    const f =
      req.user.role === 'farmer'
        ? { farmer: req.user._id }
        : { buyer: req.user._id };

    const tx = await Transaction
      .find(f)
      .populate(
        'listing',
        'cropName unit location imageUrl'
      )
      .populate(
        'buyer',
        'name email phone state district village'
      )
      .populate(
        'farmer',
        'name email phone state district village'
      )
      .sort({ createdAt: -1 })
      .lean();

    res.json(tx);
  } catch (e) {
    next(e);
  }
}


export async function getTransaction(req, res, next) {
  try {
    const tx = await Transaction
      .findById(req.params.id)
      .populate(
        'listing',
        'cropName unit location imageUrl description'
      )
      .populate(
        'buyer',
        'name email phone state district village'
      )
      .populate(
        'farmer',
        'name email phone state district village'
      )
      .lean();

    if (!tx) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    if (
      ![
        String(tx.buyer._id),
        String(tx.farmer._id)
      ].includes(String(req.user._id))
    ) {
      return res.status(403).json({
        message: 'Not authorized'
      });
    }

    res.json(tx);
  } catch (e) {
    next(e);
  }
}