const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hrms';
  try {
    // Attempt connecting to configured MongoDB
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[Database] Connected to MongoDB at ${mongoUri}`);
  } catch (error) {
    console.warn(`[Database] Could not connect to local MongoDB (${error.message}). Initializing MongoMemoryServer fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[Database] Connected to MongoMemoryServer at ${inMemoryUri}`);
    } catch (memError) {
      console.error('[Database] Failed to connect to MongoMemoryServer:', memError);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
