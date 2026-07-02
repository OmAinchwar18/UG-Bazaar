const { Server } = require('socket.io');
const logger = require('../utils/logger');

let ioInstance = null;

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  ioInstance = io;

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
      logger.info(`User ${userId} joined room user_${userId}`);
    });

    socket.on('join_order', (orderId) => {
      socket.join(`order_${orderId}`);
      logger.info(`Socket joined room order_${orderId}`);
    });

    socket.on('send_message', (data) => {
      const { roomId, senderId, senderName, text } = data;
      io.to(roomId).emit('receive_message', {
        senderId,
        senderName,
        text,
        timestamp: new Date()
      });
      logger.info(`Chat message in room ${roomId} by ${senderName}: ${text}`);
    });

    socket.on('driver_location_update', (data) => {
      const { orderId, latitude, longitude } = data;
      io.to(`order_${orderId}`).emit('driver_location', { latitude, longitude, timestamp: new Date() });
      logger.debug(`Driver coordinates for Order ${orderId}: ${latitude}, ${longitude}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => ioInstance;

const emitOrderStatusChange = (userId, orderId, status, message) => {
  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit('order_status_change', {
      orderId,
      status,
      message,
      timestamp: new Date()
    });
    logger.info(`Emitted status change event to user_${userId} for order ${orderId}`);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitOrderStatusChange
};
