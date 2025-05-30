// app.js
import 'dotenv/config';
import express from 'express';
import mainRoute from './routes/main.router.js';
import passport from 'passport';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { closeAllConnections } from './utils/getTenantDb.js';

const allowedOrigins = [
  'http://localhost:8081',
  'http://192.168.210.147:8081',
];

const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply middleware
const app = express();
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.use(mainRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    status: 'failed',
    message: err.message || 'Internal server error'
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received, shutting down gracefully');
  server.close(async () => {
    console.log('HTTP server closed');
    await closeAllConnections();
    process.exit(0);
  });
});