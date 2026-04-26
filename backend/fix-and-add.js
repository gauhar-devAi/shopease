require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // Fix the missing images for the Laptop Stand and Gaming Mouse
  await connection.query('UPDATE products SET image_url = ? WHERE name = ?', [
    'https://images.unsplash.com/photo-1504707748692-419802cf939d?w=800&q=80', 
    'Adjustable Laptop Stand'
  ]);
  
  await connection.query('UPDATE products SET image_url = ? WHERE name = ?', [
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80', 
    'Pro Gaming Mouse'
  ]);

  // Insert 6 more awesome products
  const newProducts = [
    {
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard with clicky blue switches.',
      price: 6500.00,
      stock: 40,
      image_url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
      category_id: 1
    },
    {
      name: 'Classic Leather Watch',
      description: 'Elegant analog watch with genuine brown leather strap.',
      price: 12000.00,
      stock: 25,
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      category_id: 2
    },
    {
      name: 'Eco Yoga Mat',
      description: 'Non-slip eco-friendly yoga mat for home workouts.',
      price: 2500.00,
      stock: 100,
      image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80',
      category_id: 4
    },
    {
      name: 'True Wireless Earbuds',
      description: 'Compact earbuds with active noise cancellation.',
      price: 8900.00,
      stock: 75,
      image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80',
      category_id: 1
    },
    {
      name: 'Travel Backpack',
      description: 'Water-resistant travel and laptop backpack with USB port.',
      price: 4800.00,
      stock: 60,
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
      category_id: 2
    },
    {
      name: 'Vintage Film Camera',
      description: 'Retro 35mm film camera for photography enthusiasts.',
      price: 15500.00,
      stock: 10,
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
      category_id: 1
    }
  ];

  let insertCount = 0;
  for (const p of newProducts) {
    const [existing] = await connection.query('SELECT id FROM products WHERE name = ?', [p.name]);
    if (existing.length === 0) {
      await connection.query(
        'INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?)',
        [p.name, p.description, p.price, p.stock, p.image_url, p.category_id]
      );
      insertCount++;
    }
  }

  console.log('Fixed the 2 images and added ' + insertCount + ' new products!');
  await connection.end();
}

run();
