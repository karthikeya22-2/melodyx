const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { router: authRouter } = require('./routes/auth');
const catalogRouter = require('./routes/catalog');
const streamRouter = require('./routes/stream');
const lyricsRouter = require('./routes/lyrics');
const libraryRouter = require('./routes/library');
const recommendationsRouter = require('./routes/recommendations');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for web and mobile clients
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range']
  })
);

app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/stream', streamRouter);
app.use('/api/lyrics', lyricsRouter);
app.use('/api/library', libraryRouter);
app.use('/api/recommendations', recommendationsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Spotube-Inspired Unified Music Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🎵 Unified Music Platform Backend listening on http://localhost:${PORT}`);
  console.log(`📡 Ready for Android Mobile App and Desktop Web App connections`);
});

