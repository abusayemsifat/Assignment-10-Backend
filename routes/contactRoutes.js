const express = require('express');
const router = express.Router();
const { submitContact, getAllContacts } = require('../controllers/contactController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.post('/', submitContact);
router.get('/', verifyToken, verifyAdmin, getAllContacts);

module.exports = router;