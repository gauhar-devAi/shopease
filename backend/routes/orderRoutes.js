const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { 
  placeOrder, 
  getMyOrders, 
  getAllOrders,
  updateOrderStatus 
} = require('../controllers/orderController');

router.post('/', protect, placeOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/all', protect, adminOnly, getAllOrders);        // admin
router.put('/:id/status', protect, adminOnly, updateOrderStatus); // admin

module.exports = router;