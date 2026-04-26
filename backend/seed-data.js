require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const adminPasswordHash = await bcrypt.hash('admin123', 10);

    // Seed categories only if they do not already exist.
    await connection.query(
      `INSERT INTO categories (name)
       SELECT * FROM (SELECT 'Electronics' AS name) AS tmp
       WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Electronics')`
    );

    await connection.query(
      `INSERT INTO categories (name)
       SELECT * FROM (SELECT 'Clothing' AS name) AS tmp
       WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Clothing')`
    );

    await connection.query(
      `INSERT INTO categories (name)
       SELECT * FROM (SELECT 'Books' AS name) AS tmp
       WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Books')`
    );

    await connection.query(
      `INSERT INTO categories (name)
       SELECT * FROM (SELECT 'Home & Kitchen' AS name) AS tmp
       WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Home & Kitchen')`
    );

    const [categories] = await connection.query('SELECT id, name FROM categories');
    const categoryByName = Object.fromEntries(categories.map((c) => [c.name, c.id]));

    const products = [
      ['Wireless Headphones', 'High quality sound, noise cancelling', 2999.0, 50, 'headphones.jpg', 'Electronics'],
      ['Smartphone Case', 'Protective case for all phones', 499.0, 100, 'case.jpg', 'Electronics'],
      ['Men T-Shirt', 'Cotton comfortable t-shirt', 799.0, 75, 'tshirt.jpg', 'Clothing'],
      ['Python Programming Book', 'Learn Python from scratch', 1200.0, 30, 'book.jpg', 'Books'],
      ['Coffee Mug', 'Ceramic mug 350ml', 350.0, 60, 'mug.jpg', 'Home & Kitchen'],
    ];

    for (const [name, description, price, stock, imageUrl, categoryName] of products) {
      await connection.query(
        `INSERT INTO products (name, description, price, stock, image_url, category_id)
         SELECT * FROM (SELECT ?, ?, ?, ?, ?, ?) AS tmp
         WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = ?)`,
        [name, description, price, stock, imageUrl, categoryByName[categoryName], name]
      );
    }

    await connection.query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         password = VALUES(password),
         role = VALUES(role)`,
      [
        'Admin User',
        'admin@shopease.com',
        adminPasswordHash,
        'admin',
      ]
    );

    const [counts] = await connection.query(
      `SELECT
         (SELECT COUNT(*) FROM categories) AS categories,
         (SELECT COUNT(*) FROM products) AS products,
         (SELECT COUNT(*) FROM users) AS users`
    );

    const [productRows] = await connection.query(
      'SELECT id, name, price, stock, category_id FROM products ORDER BY id'
    );

    console.log('Seed complete:', counts[0]);
    console.log('Products:', productRows);
    console.log('Admin login credentials: admin@shopease.com / admin123');
  } finally {
    await connection.end();
  }
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
