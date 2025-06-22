/*
// mongodb-connection.js
import mongoose from "mongoose";
import dns from 'dns';
import "dotenv/config";

// Force IPv4 resolution to help with some cloud hosting environments
dns.setDefaultResultOrder('ipv4first');

const connectToMongoDB = async () => {
  const url = process.env.MONGO_URL;
  
  if (!url) {
    console.error("MongoDB connection URL is missing. Set MONGO_URL in environment variables.");
    process.exit(1);
  }

  try {
    // Add helpful connection options
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 60000, // Longer timeout for server selection
      socketTimeoutMS: 45000,          // How long sockets stay open with no activity
      connectTimeoutMS: 30000,         // Connection timeout
      heartbeatFrequencyMS: 30000,     // How often to check the connection
      maxPoolSize: 10,                 // Maintain up to 10 socket connections
    });
    
    console.log("MongoDB connected successfully");
    
    // Set up connection event listeners for better debugging
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
    return mongoose.connection;
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};

export default connectToMongoDB;

*/


// mongodb-connection.js
import mongoose from "mongoose";
import dns from 'dns';
import "dotenv/config";

dns.setDefaultResultOrder('ipv4first');

let connection = null;

const connectToMongoDB = async () => {
  const url = process.env.MONGO_URL;

  if (!url) {
    console.error("MongoDB connection URL is missing.");
    process.exit(1);
  }

  if (connection) {
    return connection;
  }

  try {
    // 👇 createConnection instead of connect
    connection = mongoose.createConnection(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    connection.on("connected", () => {
      console.log("MongoDB tenant connection established");
    });

    connection.on("error", (err) => {
      console.error("MongoDB tenant connection error:", err);
    });

    return connection;
  } catch (err) {
    console.error("MongoDB tenant connection failed:", err);
    process.exit(1);
  }
};

export default connectToMongoDB;
