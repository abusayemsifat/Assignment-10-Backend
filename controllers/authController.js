const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, photoURL } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const db = getDB();
    const users = db.collection('users');

    const existing = await users.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      photoURL: photoURL || '',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await users.insertOne(newUser);
    const token = generateToken({ _id: result.insertedId, email, role: 'user' });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: result.insertedId,
        name,
        email,
        photoURL: newUser.photoURL,
        role: 'user',
      },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const db = getDB();
    const users = db.collection('users');
    const user = await users.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.password) {
      return res.status(401).json({ message: 'Please use Google login for this account' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

const firebaseSync = async (req, res, next) => {
  try {
    const { name, email, photoURL, uid } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const db = getDB();
    const users = db.collection('users');

    let user = await users.findOne({ email });

    if (!user) {
      const result = await users.insertOne({
        name: name || email.split('@')[0],
        email,
        photoURL: photoURL || '',
        firebaseUid: uid,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      user = await users.findOne({ _id: result.insertedId });
    } else if (uid && !user.firebaseUid) {
      await users.updateOne({ email }, { $set: { firebaseUid: uid, updatedAt: new Date() } });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const db = getDB();
    const users = db.collection('users');
    const user = await users.findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, firebaseSync, getMe };