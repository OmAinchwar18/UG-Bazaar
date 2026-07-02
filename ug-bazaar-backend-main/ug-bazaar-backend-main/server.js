require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/sockets/socket.handler');
const logger = require('./src/utils/logger');

// Load background workers
require('./src/jobs/worker');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io wrapper
initSocket(server);

connectDB()
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 UG Bazaar Backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Database connection failed. Exiting process...', err);
    process.exit(1);
  });
