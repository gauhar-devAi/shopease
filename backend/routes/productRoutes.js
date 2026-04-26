const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllProducts, getProductById, addProduct,
  updateProduct, deleteProduct, getCategories
} = require('../controllers/productController');

router.get('/', getAllProducts);               // public
router.get('/categories', getCategories);      // public
router.get('/:id', getProductById);            // public
router.post('/', protect, adminOnly, addProduct);          // admin only
router.put('/:id', protect, adminOnly, updateProduct);     // admin only
router.delete('/:id', protect, adminOnly, deleteProduct);  // admin only

module.exports = router;