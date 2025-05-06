import mongoose from "mongoose"
import dotenv from 'dotenv';
dotenv.config();

export const connectToDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection
    }

    const conn = await mongoose.connect(process.env.MONGO)
    
    console.log("MongoDB Connected")
    return conn
  } catch (error) {
    console.error("Error connecting to MongoDB:", error)
    // More detailed error logging
    if (error.name === 'MongoServerSelectionError') {
      console.error("Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted.")
    }
    throw new Error("Failed to connect to database")
  }
}