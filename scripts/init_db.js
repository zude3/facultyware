const db = require('../lib/db');
const bcrypt = require('bcryptjs');

async function init() {
  try {
    // Drop existing table if it exists
    await db.query('DROP TABLE IF EXISTS users');
    
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created successfully.');

    // Check if admin user exists
    const [rows] = await db.query('SELECT * FROM users WHERE name = ?', ['admin']);
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('password', 10);
      await db.query('INSERT INTO users (name, password) VALUES (?, ?)', ['admin', hashedPassword]);
      console.log('Test user "admin" created with password "password".');
    } else {
      console.log('Test user "admin" already exists.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

init();
