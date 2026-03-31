const Product = require('../models/productModel');
const logger = require('../utils/logger');
const Joi = require('joi');
const fs = require('fs');
const path = require('path');

const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).required(),
  price: Joi.number().min(0).required(),
  category: Joi.string().required(),
  stock: Joi.number().integer().min(0).default(0)
});

const updateSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().min(10),
  price: Joi.number().min(0),
  category: Joi.string(),
  stock: Joi.number().integer().min(0)
});

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const product = await Product.create({
      ...value,
      image,
      createdBy: req.user._id
    });

    logger.info(`Product created: ${product.name} by ${req.user._id}`);
    res.status(201).json({ success: true, product });
  } catch (err) {
    logger.error('Create product error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const { category, sort, page = 1, limit = 10, search } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    let sortOptions = { createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split(':');
      sortOptions = { [field]: order === 'desc' ? -1 : 1 };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products
    });
  } catch (err) {
    logger.error('Get products error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json({ success: true, product });
  } catch (err) {
    logger.error('Get product error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    // Only creator or admin can update
    if (product.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this product.' });
    }

    if (req.file) {
      // Delete old image
      if (product.image) {
        const oldPath = path.join(__dirname, '../../', product.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      value.image = `/uploads/${req.file.filename}`;
    }

    Object.assign(product, value);
    await product.save();

    logger.info(`Product updated: ${product._id}`);
    res.json({ success: true, product });
  } catch (err) {
    logger.error('Update product error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    if (product.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this product.' });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    logger.info(`Product deleted: ${product._id}`);
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    logger.error('Delete product error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct };