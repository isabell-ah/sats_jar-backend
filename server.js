// server.js
const app = require('./app');
const config = require('./config/config');
const { setupWebSocketServer } = require('./routes/websocketRoutes');
const logger = require('./utils/logger');

// Get port from config or use default
const PORT = config.server.port || 3000;

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`Sats Jar Junior API running on port ${PORT}`);
  logger.info(`Server URL: ${config.server.baseUrl}`);

  // Log configuration for debugging
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('JWT Secret configured:', !!config.server.jwtSecret);
  logger.info('Firebase initialized with project:', config.firebase.projectId);
  logger.info(
    'CORS origins:',
    JSON.stringify(app.get('corsOrigins') || 'Not explicitly set')
  );
});

// Set up WebSocket server for real-time notifications
const wss = setupWebSocketServer(server);
console.log('WebSocket server initialized for real-time payment notifications');

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Consider graceful shutdown in production
  if (process.env.NODE_ENV === 'production') {
    logger.error('Shutting down server due to unhandled promise rejection');
    server.close(() => {
      process.exit(1);
    });
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Always shutdown on uncaught exceptions as the application state is unreliable
  logger.error('Shutting down server due to uncaught exception');
  server.close(() => {
    process.exit(1);
  });
});

module.exports = server;
