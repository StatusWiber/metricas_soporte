import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gestionsRouter from './routes/gestiones.js';
import desviosRouter from './routes/desvios.js';
import webhooksRouter from './routes/webhooks.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Wiber Metrics'
  });
});

// Routes
app.use('/api/gestiones', gestionsRouter);
app.use('/api/desvios', desviosRouter);
app.use('/api/webhooks', webhooksRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Health check: GET /api/health`);
});

export default app;
