const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = 4000;

app.use(bodyParser.json());
// Use CORS middleware to allow cross-origin requests
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests only from this origin (your React app)
  methods: 'GET,POST,PUT,DELETE', // Allow certain HTTP methods
  allowedHeaders: 'Content-Type, Authorization', // Allow certain headers
}));

// Setup database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});
// Add this at the top of your backend routes to handle root requests
app.get('/', (req, res) => {
  res.send('Hello, World!');  // This will respond with a simple message
});


// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log(username);
  console.log(password);

  const query = 'SELECT * FROM users WHERE username = ?';
  db.execute(query, [username], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = result[0];

    // Check if password matches
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      // Generate JWT token
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '5m' });

      res.json({
        message: 'Login successful',
        token: token
      });
    });
  });
});

// GET all products
app.get('/products', (req, res) => {
  const query = 'SELECT * FROM products';
  db.execute(query, (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(result);
  });
});

// POST a new product
app.post('/products', (req, res) => {
  const { name, price, quantity } = req.body;
  const query = 'INSERT INTO products (name, price, quantity) VALUES (?, ?, ?)';
  db.execute(query, [name, price, quantity], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json({ message: 'Product added successfully', productId: result.insertId });
  });
});

// DELETE a product
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM products WHERE id = ?';
  db.execute(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json({ message: 'Product deleted successfully' });
  });
});

// Update a product
app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, quantity } = req.body;
  const query = 'UPDATE products SET name = ?, price = ?, quantity = ? WHERE id = ?';
  db.execute(query, [name, price, quantity, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json({ message: 'Product updated successfully' });
  });
});

// Middleware to verify JWT and user role
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) return res.status(401).json({ message: 'Access Denied' });

  // Remove 'Bearer ' from token string if it exists
  const tokenWithoutBearer = token.startsWith('Bearer ') ? token.slice(7) : token;

  jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;  // Attach the decoded user to the request
    next();  // Call the next middleware or route handler
  });
}

// Bill a product (Bill person can only reduce quantity)
app.post('/bill', authenticateToken, (req, res) => {
  const { productId, quantity } = req.body;

  // Get current product quantity
  const getProductQuery = 'SELECT * FROM products WHERE id = ?';
  db.execute(getProductQuery, [productId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (result.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = result[0];

    // Check if enough stock is available
    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    // Update product quantity
    const updateQuantityQuery = 'UPDATE products SET quantity = quantity - ? WHERE id = ?';
    db.execute(updateQuantityQuery, [quantity, productId], (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json({ message: 'Product billed successfully', remainingQuantity: product.quantity - quantity });
    });
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});