'use client';

import { useGlobalState } from '@/store';
import { createContext, useContext, useEffect, useState } from 'react';
import { useWalletContext } from './wallet';
import { io } from 'socket.io-client';
import CONFIG from '@/config';

export const NakamaContext = createContext<any>({});
export const useNakamaContext = () => useContext(NakamaContext);

export function NakamaProvider({ children }) {
  const gState = useGlobalState();

  const [ctxSocket, setCtxSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // if wallet is disconnected, disconnect the socket
  useEffect(() => {
    if (!gState['verify'].value && ctxSocket) {
      ctxSocket.disconnect();
      setCtxSocket(null);
      setSocketConnected(false);
    }
  }, [gState['verify']]);

  const socketInitializer = async (userData) => {
    let newSocket = io(CONFIG.setting.wss, {
      transports: ['websocket'],
    });
    newSocket.on('connect', () => {
      newSocket.emit('join', `${userData.id}-${userData.playfab_id}`);
      console.log('socket connected');
    });
    newSocket.on('disconnect', (reason) => {
      console.log(reason);
      // else the socket will automatically try to reconnect
    });

    setSocketConnected(true);
    setCtxSocket(newSocket);
    console.log('socket initializer called');
  };

  return (
    <NakamaContext.Provider
      value={{ socketInitializer, socketConnected, ctxSocket }}
    >
      {children}
    </NakamaContext.Provider>
  );
}
