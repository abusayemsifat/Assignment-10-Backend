const { getDB } = require('../config/db');

const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const db = getDB();
    const result = await db.collection('contacts').insertOne({
      name,
      email,
      subject,
      message,
      status: 'unread',
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      id: result.insertedId,
    });
  } catch (err) {
    next(err);
  }
};

const getAllContacts = async (req, res, next) => {
  try {
    const db = getDB();
    const contacts = await db.collection('contacts')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, contacts });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitContact, getAllContacts };