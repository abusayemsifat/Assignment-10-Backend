const { getDB } = require('../config/db');

const getAdminStats = async (req, res, next) => {
  try {
    const db = getDB();

    const [totalUsers, totalServices, totalOrders, revenueAgg] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('services').countDocuments(),
      db.collection('orders').countDocuments(),
      db.collection('orders').aggregate([
        { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$quantity'] } } } }
      ]).toArray(),
    ]);

    const revenue = revenueAgg[0]?.total || 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyOrders = await db.collection('orders').aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: { $multiply: ['$price', '$quantity'] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]).toArray();

    const categoryDist = await db.collection('services').aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]).toArray();

    const recentOrders = await db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    const recentUsers = await db.collection('users')
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    res.json({
      success: true,
      stats: { totalUsers, totalServices, totalOrders, revenue },
      monthlyOrders,
      categoryDist,
      recentOrders,
      recentUsers,
    });
  } catch (err) {
    next(err);
  }
};

const getUserStats = async (req, res, next) => {
  try {
    const db = getDB();

    const [myServices, myOrders] = await Promise.all([
      db.collection('services').countDocuments({ email: req.user.email }),
      db.collection('orders').countDocuments({ buyerEmail: req.user.email }),
    ]);

    const recentOrders = await db.collection('orders')
      .find({ buyerEmail: req.user.email })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    const recentServices = await db.collection('services')
      .find({ email: req.user.email })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    res.json({
      success: true,
      stats: { myServices, myOrders },
      recentOrders,
      recentServices,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAdminStats, getUserStats };