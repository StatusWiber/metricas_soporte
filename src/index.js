import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gestionesRouter from './routes/gestiones.js';
import desviosRouter from './routes/desvios.js';
import webhooksRouter from './routes/webhooks.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Wiber Metrics API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      gestiones: '/api/gestiones',
      desvios: '/api/desvios',
      webhooks: '/api/webhooks',
      metricas_equipo: '/api/gestiones/metricas/equipo',
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Wiber Metrics',
  });
});

// Routes
app.use('/api/gestiones', gestionesRouter);
app.use('/api/desvios', desviosRouter);
app.use('/api/webhooks', webhooksRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
});

// Global error handler
app.use(errorHandler);

// Start server only in development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ Health check: GET /api/health`);
  });
}

// Export for Vercel and local use
export default app;
