require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const { logger } = require('./utils/logger');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});