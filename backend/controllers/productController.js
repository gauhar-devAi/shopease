const db = require('../config/db');

// Get ALL products (with optional search & category filter)
const getAllProducts = async (req, res) => {
  try {
    // Get search and category from URL query
    // Example: /api/products?search=phone&category=1
    const { search, category } = req.query;

    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    let params = [];

    // Add search filter if provided
    if (search) {
      query += ' AND p.name LIKE ?';
      params.push(`%${search}%`);
    }

    // Add category filter if provided
    if (category) {
      query += ' AND p.category_id = ?';
      params.push(category);
    }

    const [products] = await db.query(query, params);
    res.json({ success: true, products });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get ONE product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ success: true, product: products[0] });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ADD a new product (admin only)
const addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, image_url, category_id } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    await db.query(
      'INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, stock, image_url, category_id]
    );

    res.status(201).json({ message: 'Product added successfully!' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE a product (admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, image_url, category_id } = req.body;

    await db.query(
      'UPDATE products SET name=?, description=?, price=?, stock=?, image_url=?, category_id=? WHERE id=?',
      [name, description, price, stock, image_url, category_id, id]
    );

    res.json({ message: 'Product updated successfully!' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE a product (admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories');
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  getAllProducts, 
  getProductById, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  getCategories
};