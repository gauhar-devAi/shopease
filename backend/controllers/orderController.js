const db = require('../config/db');

// Place a new order
const placeOrder = async (req, res) => {
  let connection;

  try {
    const { cartItems } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const normalizedItems = cartItems.map((item) => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity)
    }));

    const hasInvalidItem = normalizedItems.some(
      (item) => !Number.isInteger(item.product_id) || !Number.isInteger(item.quantity) || item.quantity <= 0
    );

    if (hasInvalidItem) {
      return res.status(400).json({ message: 'Invalid cart items' });
    }

    const quantityByProduct = new Map();
    normalizedItems.forEach((item) => {
      quantityByProduct.set(
        item.product_id,
        (quantityByProduct.get(item.product_id) || 0) + item.quantity
      );
    });

    const productIds = [...quantityByProduct.keys()];
    if (productIds.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const placeholders = productIds.map(() => '?').join(',');
    const [products] = await connection.query(
      `SELECT id, name, price, stock FROM products WHERE id IN (${placeholders}) FOR UPDATE`,
      productIds
    );

    if (products.length !== productIds.length) {
      await connection.rollback();
      return res.status(400).json({ message: 'Some products are no longer available' });
    }

    const productById = new Map(products.map((p) => [p.id, p]));

    for (const [productId, quantity] of quantityByProduct.entries()) {
      const product = productById.get(productId);
      if (!product || product.stock < quantity) {
        await connection.rollback();
        return res.status(400).json({
          message: `Insufficient stock for ${product ? product.name : 'a product'}`
        });
      }
    }

    let totalPrice = 0;
    for (const [productId, quantity] of quantityByProduct.entries()) {
      const product = productById.get(productId);
      totalPrice += Number(product.price) * quantity;
    }

    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_price) VALUES (?, ?)',
      [userId, totalPrice]
    );

    const orderId = orderResult.insertId;

    for (const [productId, quantity] of quantityByProduct.entries()) {
      const product = productById.get(productId);

      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, productId, quantity, product.price]
      );

      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [quantity, productId]
      );
    }

    await connection.commit();

    res.status(201).json({ 
      message: 'Order placed successfully!', 
      orderId,
      totalPrice
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('Order error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Get logged-in user's orders
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const [orders] = await db.query(
      `SELECT o.*, 
        GROUP_CONCAT(p.name SEPARATOR ', ') as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );

    res.json({ success: true, orders });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get ALL orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, u.name as customer_name, u.email,
        GROUP_CONCAT(p.name SEPARATOR ', ') as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'processing', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE id = ?', 
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  placeOrder, 
  getMyOrders, 
  getAllOrders, 
  updateOrderStatus 
};
