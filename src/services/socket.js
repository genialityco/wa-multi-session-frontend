import io from 'socket.io-client';
import { BACKEND_URL } from './api';

let socket;

export const initiateSocketConnection = (clientId) => {
  if (socket) socket.disconnect();
  
  socket = io(BACKEND_URL, {
    transports: ['websocket'],
    query: { clientId } // Some backends might use query params, but our current one uses emit('join')
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized. Call initiateSocketConnection first.");
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

export const subscribeToEvents = (socketInstance, events) => {
    if (!socketInstance) return;
    Object.keys(events).forEach(event => {
        socketInstance.on(event, events[event]);
    });
};

export const unsubscribeFromEvents = (socketInstance, events) => {
    if (!socketInstance) return;
    Object.keys(events).forEach(event => {
        socketInstance.off(event);
    });
};
