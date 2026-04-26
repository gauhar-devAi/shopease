require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateProductImages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const updates = [
    ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 'Wireless Headphones'],
    ['https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800&q=80', 'Smartphone Case'],
    ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 'Men T-Shirt'],
    ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80', 'Python Programming Book'],
    ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80', 'Coffee Mug'],
    ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80', 'Bluetooth Speaker X200'],
  ];

  for (const [image, name] of updates) {
    await connection.query('UPDATE products SET image_url = ? WHERE name = ?', [image, name]);
  }

  console.log('Images updated successfully.');
  await connection.end();
}

updateProductImages();
