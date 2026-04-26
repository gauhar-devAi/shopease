require('dotenv').config();
const mysql = require('mysql2/promise');

async function insertMoreProducts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  const [categories] = await connection.query('SELECT id, name FROM categories');
  const categoryByName = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  // Keep main catalog images as real internet images (not local icon placeholders).
  const localImageFixes = [
    ['Wireless Headphones', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
    ['Smartphone Case', 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800&q=80'],
    ['Men T-Shirt', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
    ['Python Programming Book', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80'],
    ['Coffee Mug', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80'],
  ];

  for (const [name, imageUrl] of localImageFixes) {
    await connection.query('UPDATE products SET image_url = ? WHERE name = ?', [imageUrl, name]);
  }

  const newProducts = [
    {
      name: 'Adjustable Laptop Stand',
      description: 'Ergonomic aluminum stand for all laptops',
      price: 3500.00,
      stock: 120,
      image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479bd?w=800&q=80',
      category_name: 'Electronics'
    },
    {
      name: 'Pro Gaming Mouse',
      description: 'RGB customizable gaming mouse with 10k DPI',
      price: 4200.00,
      stock: 80,
      image_url: 'https://images.unsplash.com/photo-1615663245857-ac1eeb5366b4?w=800&q=80',
      category_name: 'Electronics'
    },
    {
      name: 'Sport Running Shoes',
      description: 'Lightweight and breathable sneakers',
      price: 8500.00,
      stock: 45,
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      category_name: 'Clothing'
    },
    {
      name: 'Insulated Water Bottle',
      description: 'Stainless steel 1L bottle keeps water cold for 24h',
      price: 2000.00,
      stock: 200,
      image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
      category_name: 'Home & Kitchen'
    },
    {
      name: 'Sci-Fi Bestseller Book',
      description: 'Award-winning science fiction novel',
      price: 1500.00,
      stock: 60,
      image_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80',
      category_name: 'Books'
    },
    {
      name: 'Modern Desk Lamp',
      description: 'LED desk lamp with wireless charging base',
      price: 5500.00,
      stock: 35,
      image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      category_name: 'Home & Kitchen'
    }
  ];

  let insertCount = 0;
  for (const p of newProducts) {
    const categoryId = categoryByName[p.category_name];
    if (!categoryId) {
      console.warn(`Skipped ${p.name}: category ${p.category_name} not found`);
      continue;
    }

    const [existing] = await connection.query('SELECT id FROM products WHERE name = ?', [p.name]);
    if (existing.length === 0) {
      await connection.query(
        'INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?)',
        [p.name, p.description, p.price, p.stock, p.image_url, categoryId]
      );
      insertCount++;
    }
  }

  console.log('Inserted ' + insertCount + ' new products successfully!');
  await connection.end();
}

insertMoreProducts();
