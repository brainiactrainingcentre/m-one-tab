// utils/getTenantDb.js
import mongoose from 'mongoose';
import {ApiError} from './ApiError.js';

const connections = {};

const getTenantDb = async (tenantId) => {
  if (connections[tenantId]) {
    return connections[tenantId];
  }
  
  try {
    const baseUri = process.env.MONGO_BASE_URI || 'mongodb+srv://Harendraranjan:Harendraranjanonetab@erp.rpkkz.mongodb.net';
    const dbName = `${tenantId}`;
    const dbUri = `${baseUri}/${dbName}?retryWrites=true&w=majority&appName=erp&socketTimeoutMS=45000&connectTimeoutMS=30000&serverSelectionTimeoutMS=60000`;

    const connection = await mongoose.createConnection(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
    });

    connection.on('error', (err) => {
      console.error(`MongoDB connection error for tenant ${tenantId}:`, err);
    });

    connection.on('disconnected', () => {
      console.log(`MongoDB disconnected for tenant ${tenantId}`);
      delete connections[tenantId];
    });

    connections[tenantId] = connection;
    console.log(`Created new database connection for tenant: ${tenantId}`);

    return connection;
  } catch (error) {
    console.error(`Failed to connect to database for tenant ${tenantId}:`, error);
    throw new ApiError(500, `Database connection failed for tenant ${tenantId}`);
  }
};

const closeAllConnections = async () => {
  for (const tenant of Object.keys(connections)) {
    await connections[tenant].close();
    delete connections[tenant];
    console.log(`Closed connection for tenant: ${tenant}`);
  }
};

// Add process event handlers for graceful shutdown
process.on('SIGINT', async () => {
  await closeAllConnections();
  console.log('All tenant database connections closed due to app termination');
  process.exit(0);
});

export { getTenantDb, closeAllConnections };