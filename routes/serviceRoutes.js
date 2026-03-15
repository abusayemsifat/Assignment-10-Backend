const express = require('express');
const router = express.Router();
const {
  getServices, getFeatured, getServiceById, getMyServices,
  createService, updateService, deleteService, addReview
} = require('../controllers/serviceController');
const { verifyToken } = require('../middleware/auth');

router.get('/', getServices);
router.get('/featured', getFeatured);
router.get('/my-services', verifyToken, getMyServices);
router.get('/:id', getServiceById);
router.post('/', verifyToken, createService);
router.put('/:id', verifyToken, updateService);
router.delete('/:id', verifyToken, deleteService);
router.post('/:id/reviews', verifyToken, addReview);

module.exports = router;