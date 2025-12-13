import { io } from 'socket.io-client';
import { getToken } from '../services/token.js';

let socket;

export async function createSocket() {
  const token = await getToken();

  socket = io(import.meta.env.VITE_API_BASE_URL_SOCKET,{
    auth: { token }
  });

  return socket;
}

export async function getSocket() {
  return socket;
}


