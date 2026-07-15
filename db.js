const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Ensure data folder exists
function ensureDirExists(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// Function to extract seed products from assets/js/site.js
function extractSeedProducts() {
  try {
    const siteJsPath = path.join(__dirname, 'assets', 'js', 'site.js');
    if (!fs.existsSync(siteJsPath)) {
      console.warn('site.js not found. Seeding empty products.');
      return {};
    }
    
    const content = fs.readFileSync(siteJsPath, 'utf8');
    const startIdx = content.indexOf('const BP_PRODUCTS = {');
    if (startIdx === -1) {
      console.warn('BP_PRODUCTS definition not found in site.js. Seeding empty products.');
      return {};
    }
    
    // Find the matching closing bracket
    let bracketCount = 0;
    let endIdx = -1;
    for (let i = startIdx + 'const BP_PRODUCTS ='.length; i < content.length; i++) {
      if (content[i] === '{') {
        bracketCount++;
      } else if (content[i] === '}') {
        bracketCount--;
        if (bracketCount === 0) {
          endIdx = i;
          break;
        }
      }
    }
    
    if (endIdx === -1) {
      console.warn('Matching closing bracket for BP_PRODUCTS not found. Seeding empty products.');
      return {};
    }
    
    const objText = content.substring(startIdx + 'const BP_PRODUCTS ='.length, endIdx + 1);
    // Dynamic evaluation via Function
    const getProducts = new Function(`return ${objText};`);
    return getProducts();
  } catch (e) {
    console.error('Failed to extract products seed from site.js:', e);
    return {};
  }
}

// Default/Seed Database
function getInitialDb() {
  const seedProducts = extractSeedProducts();
  return {
    products: seedProducts,
    users: [
      { id: "7818870265", phone: "7818870265", email: "ramji@gmail.com", name: "Ramji Yadav", role: "user" },
      { id: "9876543210", phone: "9876543210", email: "driver@gmail.com", name: "Harpreet Singh", role: "user" },
      { id: "admin", phone: "admin", email: "admin@tractechspares.com", name: "System Admin", role: "admin" }
    ],
    settings: {
      heroTitle: "Premium Seats & Silencers.\nFactory to Your Field.",
      heroSubtitle: "OEM-engineered mechanical suspension seats and heavy-duty silencers for every major Indian tractor and truck. Pan-India Delivery.",
      promoBanner: "🔥 FACTORY DIRECT SALE: 18% GST invoice available + FREE shipping on orders above ₹3,000! 🔥",
      contactPhone: "+91 78188 70265",
      contactEmail: "tractechspares@gmail.com",
      footerText: "© 2026 Tractechspares.com — Ground-Zero Factory Direct. All rights reserved."
    },
    orders: []
  };
}

// Read database file
function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initial = getInitialDb();
      writeDb(initial);
      return initial;
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading database file, resetting to initial state:', e);
    const initial = getInitialDb();
    writeDb(initial);
    return initial;
  }
}

// Write database file
function writeDb(data) {
  try {
    ensureDirExists(DB_PATH);
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error writing database file:', e);
    return false;
  }
}

// Export database operations
module.exports = {
  // Products
  getProducts: () => readDb().products,
  getProduct: (id) => readDb().products[id] || null,
  saveProduct: (id, productData) => {
    const db = readDb();
    db.products[id] = { ...db.products[id], ...productData, id };
    writeDb(db);
    return db.products[id];
  },
  deleteProduct: (id) => {
    const db = readDb();
    if (db.products[id]) {
      delete db.products[id];
      writeDb(db);
      return true;
    }
    return false;
  },

  // Users
  getUsers: () => readDb().users,
  getUser: (id) => readDb().users.find(u => u.id === id) || null,
  saveUser: (id, userData) => {
    const db = readDb();
    const idx = db.users.findIndex(u => u.id === id);
    const userObj = { ...userData, id };
    if (idx > -1) {
      db.users[idx] = { ...db.users[idx], ...userObj };
    } else {
      db.users.push(userObj);
    }
    writeDb(db);
    return userObj;
  },
  deleteUser: (id) => {
    const db = readDb();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx > -1) {
      db.users.splice(idx, 1);
      writeDb(db);
      return true;
    }
    return false;
  },

  // Settings
  getSettings: () => readDb().settings,
  saveSettings: (settingsData) => {
    const db = readDb();
    db.settings = { ...db.settings, ...settingsData };
    writeDb(db);
    return db.settings;
  },

  // Orders
  getOrders: () => readDb().orders || [],
  getOrder: (id) => (readDb().orders || []).find(o => o.id === id) || null,
  saveOrder: (orderData) => {
    const db = readDb();
    if (!db.orders) db.orders = [];
    const idx = db.orders.findIndex(o => o.id === orderData.id);
    if (idx > -1) {
      db.orders[idx] = { ...db.orders[idx], ...orderData };
    } else {
      db.orders.push(orderData);
    }
    writeDb(db);
    return orderData;
  },
  deleteOrder: (id) => {
    const db = readDb();
    if (!db.orders) return false;
    const idx = db.orders.findIndex(o => o.id === id);
    if (idx > -1) {
      db.orders.splice(idx, 1);
      writeDb(db);
      return true;
    }
    return false;
  }
};
