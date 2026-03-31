const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const upload = require('../middleware/upload');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes — seller aur admin create/update/delete kar sakte hain
router.post('/', authenticate, authorize('seller', 'admin'), upload.single('image'), createProduct);
router.put('/:id', authenticate, authorize('seller', 'admin'), upload.single('image'), updateProduct);
router.delete('/:id', authenticate, authorize('seller', 'admin'), deleteProduct);

module.exports = router;