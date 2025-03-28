"use client";
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketClient = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [serverMessage, setServerMessage] = useState('');

  useEffect(() => {
    // Connect to the Socket.IO server (change URL as needed)
    const socketIo: Socket = io('http://localhost:3001', {
      transports: ['websocket'], // optional: force websocket connection
    });

    // Set up event listeners
    socketIo.on('connection', () => {
      console.log('Connected to Socket.IO server');
    });

    // Listen for a custom event named "message"
    socketIo.on('message', (data: any) => {
      console.log('Received message:', data);
      setServerMessage(data);
    });

    // Optionally emit an event to the server on connection
    socketIo.emit('join', { room: 'general' });

    // Save the socket instance in state (if you plan on using it later)
    setSocket(socketIo);

    // Cleanup: disconnect on component unmount
    return () => {
      socketIo.disconnect();
      console.log('Disconnected from Socket.IO server');
    };
  }, []);

  return (
    <div>
      <h1>Socket.IO Client in Next.js</h1>
      <p>
        <strong>Server message:</strong> {serverMessage || 'No messages yet.'}
      </p>
    </div>
  );
};

export default SocketClient;
