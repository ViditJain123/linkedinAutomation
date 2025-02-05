const socketio = require('socket.io');
const User = require('../models/userDataModel');

let io;

function initSocket(server) {
  io = socketio(server, {
    cors: {
      origin: "http://localhost:5123",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.use(async (socket, next) => {
    try {
      const userId = socket.handshake.auth.userId;
      if (!userId) {
        return next(new Error('Authentication error'));
      }

      const user = await User.findOne({ clerkRef: userId });
      if (!user) {
        return next(new Error('User not found'));
      }
      
      socket.userId = userId;
      next();
    } catch (error) {
      console.error('Socket middleware error:', error);
      next(error);
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id, 'userId:', socket.userId);
    
    socket.join(socket.userId);

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      socket.leave(socket.userId);
    });
  });

  return io;
}

module.exports = { 
  initSocket,
  get io() { 
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};