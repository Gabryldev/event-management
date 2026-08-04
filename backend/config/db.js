

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected:", conn.connection.host);
  } catch (err) {
    console.error("MongoDB connection failed:");
    console.error(err);
    throw err;
  }
};

module.exports = connectDB;