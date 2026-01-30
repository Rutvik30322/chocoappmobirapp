import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // ============================================
    // MONGODB CONNECTION CONFIGURATION
    // ============================================
    // Choose ONE of the following connection methods:
    // 
    // OPTION 1: MongoDB Atlas (Cloud) - Uncomment the line below
    // const mongoURI = process.env.MONGODB_URI; // Atlas connection string from .env
    //
    // OPTION 2: MongoDB Local - Uncomment the line below
    // const mongoURI = 'mongodb://localhost:27017/chocolateapp'; // Local MongoDB
    // const mongoURI = 'mongodb://127.0.0.1:27017/chocolateapp'; // Alternative local connection
    //
    // OPTION 3: Use environment variable (default - can be set to either local or Atlas)
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chocolateapp';
    // ============================================

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Display connection info
    const connectionType = mongoURI.includes('mongodb+srv') || mongoURI.includes('mongodb.net') 
      ? 'MongoDB Atlas (Cloud)' 
      : 'MongoDB Local';
    
    console.log(`✅ ${connectionType} Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`💡 Make sure MongoDB is running (if using local) or check your connection string (if using Atlas)`);
    process.exit(1);
  }
};

export default connectDB;
