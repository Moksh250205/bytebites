import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import User from '@/models/user.model';
import Restaurant from '@/models/restaurant.model';

let io: Server | null = null;

export function initSocketServer(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Adjust in production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle user/restaurant joining
    socket.on('join', async (data) => {
      const { userId, userType, restaurantId } = data;

      try {
        if (userType === 'user') {
          await User.findByIdAndUpdate(userId, { socketId: socket.id });
        } else if (userType === 'restaurant') {
          await Restaurant.findByIdAndUpdate(restaurantId, { socketId: socket.id });
        }
      } catch (error) {
        console.error('Socket join error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);
      
      // Optional: Clear socket ID from database
      await Promise.all([
        User.updateOne({ socketId: socket.id }, { $unset: { socketId: 1 } }),
        Restaurant.updateOne({ socketId: socket.id }, { $unset: { socketId: 1 } })
      ]);
    });
  });

  return io;
}

// Utility function to send messages to specific socket
export function sendSocketMessage(room: string, event: string, data: any) {
  if (io) {
    io.to(room).emit(event, data);
  } else {
    console.error('Socket.io not initialized');
  }
}

// Get socket instance
export function getSocketIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}