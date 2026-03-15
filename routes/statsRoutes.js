const express = require('express');
const router = express.Router();
const { getAdminStats, getUserStats } = require('../controllers/statsController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/admin', verifyToken, verifyAdmin, getAdminStats);
router.get('/user', verifyToken, getUserStats);

module.exports = router;