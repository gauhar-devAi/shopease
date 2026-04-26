const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function insertUserWithRetry(name, email, hashedPassword, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, 'customer']
      );
      return;
    } catch (error) {
      const isTransientLock =
        error.code === 'ER_LOCK_WAIT_TIMEOUT' || error.code === 'ER_LOCK_DEADLOCK';

      if (!isTransientLock || attempt === maxRetries - 1) {
        throw error;
      }

      await delay(150 * (attempt + 1));
    }
  }
}

// ========================
// REGISTER a new user
// ========================
const register = async (req, res) => {
  try {
    // Get data sent from frontend
    const { name, email, password } = req.body;

    // Basic validation — make sure nothing is empty
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Hash the password — never store plain text passwords!
    // The "10" means how strong the hashing is (10 is standard)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to database (with brief retries for transient lock contention)
    await insertUserWithRetry(name, email, hashedPassword);

    res.status(201).json({ message: 'Account created successfully!' });

  } catch (error) {
    console.error('Register error:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already registered' });
    }

    if (error.code === 'ER_LOCK_WAIT_TIMEOUT' || error.code === 'ER_LOCK_DEADLOCK') {
      return res.status(503).json({ message: 'Database busy, please try again' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// ========================
// LOGIN existing user
// ========================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Account not found. Please create an account first.' });
    }

    const user = users[0];

    // Compare entered password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create a JWT token — like a digital ID card valid for 7 days
    const token = jwt.sign(
      { id: user.id, role: user.role },   // data inside the token
      process.env.JWT_SECRET,              // secret key from .env
      { expiresIn: '7d' }                  // expires in 7 days
    );

    // Send token and user info back to frontend
    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'customer'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, changePassword };