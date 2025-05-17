import {io} from 'socket.io-client'


export const initSocket = async () => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    const options = {
      'force new connection': true,
      reconnectionAttempts: 5,
      timeout: 10000,
      transports: ['websocket'],
    };
    return io(BACKEND_URL, options);
  };