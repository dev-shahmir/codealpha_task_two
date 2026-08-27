import { io } from 'socket.io-client';

let socket;

export function connectSocket(token) {
  if (socket?.connected) return socket;
  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    auth: { token },
    transports: ['websocket', 'polling'], // Prefer pure WebSocket first for instant zero-latency connection
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    timeout: 10000,
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = undefined;
}
