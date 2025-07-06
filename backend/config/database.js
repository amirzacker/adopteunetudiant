const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
