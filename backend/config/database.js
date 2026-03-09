const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`[SUCCESS] MongoDB Connected: ${conn.connection.host}`);
    console.log(`[DATABASE] ${conn.connection.name}`);
  } catch (error) {
    console.error(`[ERROR] MongoDB Connection Error: ${error.message}`);
    console.error('[INFO] Server will continue running without database connection');
    // Don't exit - allow server to run for troubleshooting
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('[WARNING] MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`[ERROR] MongoDB connection error: ${err}`);
});

module.exports = connectDB;
