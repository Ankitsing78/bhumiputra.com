const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom cookie parser utility
app.use((req, res, next) => {
  const cookieHeader = req.headers.cookie || '';
  req.cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const parts = cookie.split('=');
    if (parts.length === 2) {
      acc[parts[0].trim()] = parts[1].trim();
    }
    return acc;
  }, {});
  next();
});

// Serve static assets from assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Ensure upload directory exists
const imagesDir = path.join(__dirname, 'assets', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({ storage: storage });

// Admin Authentication Middleware
const ADMIN_SECRET = 'admin_secret_session_token_998877';

function requireAdmin(req, res, next) {
  if (req.cookies.admin_token === ADMIN_SECRET) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Admin session required' });
  }
}

// ----------------------------------------------------
// AUTH ENDPOINTS
// ----------------------------------------------------

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.setHeader('Set-Cookie', `admin_token=${ADMIN_SECRET}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
    return res.json({ success: true, message: 'Logged in successfully' });
  }
  return res.status(400).json({ error: 'Invalid username or password' });
});

app.post('/api/admin/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  return res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/admin/check', (req, res) => {
  const loggedIn = req.cookies.admin_token === ADMIN_SECRET;
  return res.json({ loggedIn });
});

// ----------------------------------------------------
// PUBLIC/DYNAMIC SITE ENDPOINTS
// ----------------------------------------------------

app.get('/api/products', (req, res) => {
  res.json(db.getProducts());
});

app.get('/api/products/:id', (req, res) => {
  const product = db.getProduct(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});

app.post('/api/orders', (req, res) => {
  const orderData = req.body;
  if (!orderData || !orderData.id) {
    return res.status(400).json({ error: 'Invalid order payload' });
  }
  const saved = db.saveOrder(orderData);
  res.json({ success: true, order: saved });
});

// ----------------------------------------------------
// ADMIN PROTECTED CRUD ENDPOINTS
// ----------------------------------------------------

// Products CRUD
app.post('/api/products', requireAdmin, (req, res) => {
  const productData = req.body;
  if (!productData.id || !productData.name) {
    return res.status(400).json({ error: 'Product ID and Name are required' });
  }
  const saved = db.saveProduct(productData.id, productData);
  res.json({ success: true, product: saved });
});

app.put('/api/products/:id', requireAdmin, (req, res) => {
  const saved = db.saveProduct(req.params.id, req.body);
  res.json({ success: true, product: saved });
});

app.delete('/api/products/:id', requireAdmin, (req, res) => {
  const deleted = db.deleteProduct(req.params.id);
  if (deleted) {
    res.json({ success: true, message: 'Product deleted' });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Image Upload Endpoint (handles image uploads and returns web-accessible filepath)
app.post('/api/upload', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  const relativePath = `assets/images/${req.file.filename}`;
  res.json({ success: true, filepath: relativePath });
});

// Users CRUD
app.get('/api/users', requireAdmin, (req, res) => {
  res.json(db.getUsers());
});

app.post('/api/users', (req, res) => {
  // Public/semi-public endpoint so frontend logins can register user
  const userData = req.body;
  if (!userData.id) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  const saved = db.saveUser(userData.id, userData);
  res.json({ success: true, user: saved });
});

app.put('/api/users/:id', requireAdmin, (req, res) => {
  const saved = db.saveUser(req.params.id, req.body);
  res.json({ success: true, user: saved });
});

app.delete('/api/users/:id', requireAdmin, (req, res) => {
  const deleted = db.deleteUser(req.params.id);
  if (deleted) {
    res.json({ success: true, message: 'User deleted' });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Settings Management
app.post('/api/settings', requireAdmin, (req, res) => {
  const saved = db.saveSettings(req.body);
  res.json({ success: true, settings: saved });
});

// Orders Management
app.get('/api/orders', requireAdmin, (req, res) => {
  res.json(db.getOrders());
});

app.put('/api/orders/:id', requireAdmin, (req, res) => {
  const order = db.getOrder(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  const updated = db.saveOrder({ ...order, ...req.body });
  res.json({ success: true, order: updated });
});

app.delete('/api/orders/:id', requireAdmin, (req, res) => {
  const deleted = db.deleteOrder(req.params.id);
  if (deleted) {
    res.json({ success: true, message: 'Order deleted' });
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Serve root static files (index.html, tractechspares_*.html, admin.html)
app.use(express.static(__dirname));

// Route for homepage fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback to index.html for 404s (safe demo mode)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log('==================================================');
  console.log(` TracTechSpares Showcase Server running on port ${PORT}`);
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log('==================================================');
});
