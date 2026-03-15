const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res, next) => {
  try {
    const db = getDB();
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = search
      ? {
          $or: [
            { name:  { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      db.collection('users')
        .find(query, { projection: { password: 0 } })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      db.collection('users').countDocuments(query),
    ]);

    res.json({
      success: true,
      users,
      total,
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const db = getDB();
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { role, updatedAt: new Date() } }
    );
    res.json({ success: true, message: 'User role updated' });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const db = getDB();
    await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, photoURL } = req.body;
    const db = getDB();
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { name, photoURL, updatedAt: new Date() } }
    );
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password required' });
    }

    const db = getDB();
    const user = await db.collection('users')
      .findOne({ _id: new ObjectId(req.user.id) });

    if (!user.password) {
      return res.status(400).json({ message: 'Cannot update password for social login accounts' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { password: hashed, updatedAt: new Date() } }
    );

    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, updateUserRole, deleteUser, updateProfile, updatePassword };