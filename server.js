const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static assets from assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve root static files (index.html, tractechspares_*.html)
app.use(express.static(__dirname));

// Route for homepage
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
