
const express = require('express');

const path = require('path');
const cors = require('cors');
console.log('2. Loading environment variables...');
require('dotenv').config();

const app = express();
console.log('3. Express app created');



/
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());

function loadRoute(path, routePath) {
  console.log(`Attempting to load route: ${path}`);
  try {
    const route = require(routePath);
 
    app.use(path, route);
    console.log(`✓ Route mounted at ${path}`);
    
 
    if (path === '/api/notes') {
      app.use('/notes', route);
      console.log('✓ Route also mounted at /notes for proxy compatibility');
    }
    
    return true;
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log(`- Skipping ${path} (module not found)`);
    } else {
      console.error(`Error loading route ${path}:`, error.message);
      console.error(error.stack);
    }
    return false;
  }
}

try {
  loadRoute('/api/notes', './server/routes/api/notes');
  console.log('9. Route loading complete');
} catch (error) {
  console.error('Error setting up routes:', error);
  process.exit(1);
}

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5002;

console.log('10. Starting server...');
app.listen(PORT, () => {

  console.log(`Server started at: ${new Date().toISOString()}`);
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`API Endpoint: http://localhost:${PORT}/api/notes`);
 
 
  const http = require('http');
  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/api/notes',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    console.log(`Test request to /api/notes returned status: ${res.statusCode}`);
  });
  
  req.on('error', (error) => {
    console.error('Test request failed:', error.message);
  });
  
  req.end();
});
