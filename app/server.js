const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(express.json());
app.use(express.static('public'));
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ==================== ERROR HANDLING MIDDLEWARE ====================
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ==================== DATA STORAGE (In-memory for demo) ====================
let items = [
  { id: 1, title: 'Learn Node.js', description: 'Master Express and REST APIs', completed: false, createdAt: new Date('2024-01-15') },
  { id: 2, title: 'Build a REST API', description: 'Create a fully functional API with CRUD operations', completed: true, createdAt: new Date('2024-01-20') },
  { id: 3, title: 'Add database', description: 'Integrate MongoDB or PostgreSQL', completed: false, createdAt: new Date('2024-02-01') }
];

let nextId = 4;

// ==================== ROUTES ====================

// GET - Main API info
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the REST API',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /api/health',
      items: 'GET /api/items',
      create: 'POST /api/items',
      update: 'PUT /api/items/:id',
      delete: 'DELETE /api/items/:id',
      stats: 'GET /api/stats'
    }
  });
});

// GET - Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// GET - Get all items
app.get('/api/items', asyncHandler(async (req, res) => {
  const { completed, sort } = req.query;
  
  let filtered = [...items];
  
  if (completed !== undefined) {
    filtered = filtered.filter(item => 
      item.completed === (completed === 'true')
    );
  }
  
  if (sort === 'recent') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'oldest') {
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }
  
  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
}));

// GET - Get single item
app.get('/api/items/:id', asyncHandler(async (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  
  if (!item) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    });
  }
  
  res.json({
    success: true,
    data: item
  });
}));

// POST - Create new item
app.post('/api/items', asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  
  // Validation
  if (!title || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Title is required'
    });
  }
  
  const newItem = {
    id: nextId++,
    title: title.trim(),
    description: description || '',
    completed: false,
    createdAt: new Date()
  };
  
  items.push(newItem);
  
  res.status(201).json({
    success: true,
    message: 'Item created successfully',
    data: newItem
  });
}));

// PUT - Update item
app.put('/api/items/:id', asyncHandler(async (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  
  if (!item) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    });
  }
  
  const { title, description, completed } = req.body;
  
  if (title !== undefined) item.title = title.trim();
  if (description !== undefined) item.description = description;
  if (completed !== undefined) item.completed = completed;
  
  res.json({
    success: true,
    message: 'Item updated successfully',
    data: item
  });
}));

// DELETE - Delete item
app.delete('/api/items/:id', asyncHandler(async (req, res) => {
  const index = items.findIndex(i => i.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    });
  }
  
  const deletedItem = items.splice(index, 1);
  
  res.json({
    success: true,
    message: 'Item deleted successfully',
    data: deletedItem[0]
  });
}));

// GET - Statistics
app.get('/api/stats', (req, res) => {
  const total = items.length;
  const completed = items.filter(i => i.completed).length;
  const pending = total - completed;
  
  res.json({
    success: true,
    data: {
      total,
      completed,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  });
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// ==================== START SERVER ====================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║     REST API Server Started            ║
║  Port: ${PORT}                              ║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(16)} ║
║  Visit: http://localhost:${PORT}         ║
╚════════════════════════════════════════╝
    `);
  });
}

module.exports = app;
