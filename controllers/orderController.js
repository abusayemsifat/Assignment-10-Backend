const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

const createOrder = async (req, res, next) => {
  try {
    const { productId, productName, quantity, price, address, phone, note } = req.body;
    if (!productId || !quantity || !address || !phone) {
      return res.status(400).json({ message: 'Missing required order fields' });
    }

    const db = getDB();
    const order = {
      productId,
      productName,
      buyerEmail: req.user.email,
      buyerName: req.user.name || req.user.email,
      quantity: parseInt(quantity),
      price: parseFloat(price) || 0,
      address,
      phone,
      note: note || '',
      status: 'pending',
      date: new Date(),
      createdAt: new Date(),
    };

    const result = await db.collection('orders').insertOne(order);
    res.status(201).json({ success: true, message: 'Order placed', id: result.insertedId });
  } catch (err) {
    next(err);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const db = getDB();
    const orders = await db.collection('orders')
      .find({ buyerEmail: req.user.email })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const db = getDB();
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      db.collection('orders')
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      db.collection('orders').countDocuments(query),
    ]);

    res.json({
      success: true,
      orders,
      total,
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const db = getDB();
    await db.collection('orders').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, updatedAt: new Date() } }
    );
    res.json({ success: true, message: 'Order status updated' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };