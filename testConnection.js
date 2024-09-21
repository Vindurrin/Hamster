require('dotenv').config();
const mongoose = require('mongoose');

console.log('Attempting to connect to MongoDB...');
console.log('Connection string (sanitized):', process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected successfully to MongoDB');
    process.exit(0);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    if (err.name === 'MongoServerSelectionError') {
      console.error('This error often indicates network connectivity issues or incorrect hostnames.');
    }
    if (err.name === 'MongoServerError' && err.code === 8000) {
      console.error('This error indicates incorrect username, password, or auth database.');
    }
    process.exit(1);
  });