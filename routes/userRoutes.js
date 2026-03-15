const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, deleteUser, updateProfile, updatePassword } = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/', verifyToken, verifyAdmin, getAllUsers);
router.put('/profile', verifyToken, updateProfile);
router.put('/password', verifyToken, updatePassword);
router.put('/:id/role', verifyToken, verifyAdmin, updateUserRole);
router.delete('/:id', verifyToken, verifyAdmin, deleteUser);

module.exports = router;