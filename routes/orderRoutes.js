const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.post('/', verifyToken, createOrder);
router.get('/my-orders', verifyToken, getMyOrders);
router.get('/', verifyToken, verifyAdmin, getAllOrders);
router.put('/:id/status', verifyToken, verifyAdmin, updateOrderStatus);

module.exports = router;