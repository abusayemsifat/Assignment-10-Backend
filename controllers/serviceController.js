const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

const getServices = async (req, res, next) => {
  try {
    const db = getDB();
    const col = db.collection('services');

    const {
      category = '',
      search = '',
      sort = 'newest',
      page = 1,
      limit = 8,
      minPrice,
      maxPrice,
    } = req.query;

    const query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const sortMap = {
      newest:     { createdAt: -1 },
      oldest:     { createdAt: 1  },
      price_asc:  { price: 1      },
      price_desc: { price: -1     },
    };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [services, total] = await Promise.all([
      col.find(query).sort(sortObj).skip(skip).limit(parseInt(limit)).toArray(),
      col.countDocuments(query),
    ]);

    res.json({
      success: true,
      services,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (err) {
    next(err);
  }
};

const getFeatured = async (req, res, next) => {
  try {
    const db = getDB();
    const services = await db.collection('services')
      .find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .toArray();
    res.json({ success: true, services });
  } catch (err) {
    next(err);
  }
};

const getServiceById = async (req, res, next) => {
  try {
    const db = getDB();
    const service = await db.collection('services')
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ success: true, service });
  } catch (err) {
    next(err);
  }
};

const getMyServices = async (req, res, next) => {
  try {
    const db = getDB();
    const services = await db.collection('services')
      .find({ email: req.user.email })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, services });
  } catch (err) {
    next(err);
  }
};

const createService = async (req, res, next) => {
  try {
    const { name, category, price, location, description, image, date } = req.body;
    if (!name || !category || !description || !image) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const db = getDB();
    const data = {
      name,
      category,
      price: parseFloat(price) || 0,
      location,
      description,
      image,
      date,
      email: req.user.email,
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      rating: 0,
      reviews: [],
    };

    const result = await db.collection('services').insertOne(data);
    res.status(201).json({ success: true, message: 'Service created', id: result.insertedId });
  } catch (err) {
    next(err);
  }
};

const updateService = async (req, res, next) => {
  try {
    const db = getDB();
    const service = await db.collection('services')
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (service.email !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, category, price, location, description, image, date } = req.body;
    await db.collection('services').updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          name, category,
          price: parseFloat(price) || 0,
          location, description, image, date,
          updatedAt: new Date(),
        },
      }
    );
    res.json({ success: true, message: 'Service updated' });
  } catch (err) {
    next(err);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const db = getDB();
    const service = await db.collection('services')
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (service.email !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await db.collection('services').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    next(err);
  }
};

const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment required' });
    }

    const db = getDB();
    const review = {
      _id: new ObjectId(),
      userId: req.user.id,
      userName: req.user.name || req.user.email,
      rating: parseInt(rating),
      comment,
      createdAt: new Date(),
    };

    await db.collection('services').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $push: { reviews: review } }
    );

    res.status(201).json({ success: true, review });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getServices,
  getFeatured,
  getServiceById,
  getMyServices,
  createService,
  updateService,
  deleteService,
  addReview,
};