import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { initDatabase } from './config/database.js';
import { initializeDatabase } from './models/init.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import tradesRoutes from './routes/trades.js';
import analyticsRoutes from './routes/analytics.js';
import analyzeRoutes from './routes/analyze.js';
import marketRoutes from './routes/market.js';
import aiRoutes from './routes/ai.js';
import strategiesRoutes from './routes/strategies.js';
import socialRoutes from './routes/social.js';
import alertsRoutes from './routes/alerts.js';
import { initWebSocket, getConnectedClients } from './services/websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for WebSocket support
const server = http.createServer(app);

// CORS - allow all origins for tunnel access
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

async function startServer() {
  await initDatabase();
  initializeDatabase();

  // Initialize WebSocket
  initWebSocket(server);

  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/trades', tradesRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/analyze', analyzeRoutes);
  app.use('/api/market', marketRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/strategies', strategiesRoutes);
  app.use('/api/social', socialRoutes);
  app.use('/api/alerts', alertsRoutes);

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      websocketClients: getConnectedClients()
    });
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });

  // Serve frontend static files in production
  const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDistPath));

  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket enabled on ws://localhost:${PORT}/ws`);
    console.log(`Access remotely via tunnel or your local IP`);
  });
}

startServer();
