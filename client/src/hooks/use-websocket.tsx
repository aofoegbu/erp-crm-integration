import { useEffect, useRef } from 'react';
import { wsManager } from '@/lib/websocket';

export function useWebSocket(sessionId?: number) {
  const isConnected = useRef(false);

  useEffect(() => {
    if (!isConnected.current) {
      wsManager.connect(sessionId);
      isConnected.current = true;
    }

    return () => {
      if (isConnected.current) {
        wsManager.disconnect();
        isConnected.current = false;
      }
    };
  }, [sessionId]);

  const sendMessage = (type: string, payload: any = {}) => {
    wsManager.send(type, payload);
  };

  const subscribe = (messageType: string, handler: Function) => {
    wsManager.subscribe(messageType, handler);
    
    return () => {
      wsManager.unsubscribe(messageType, handler);
    };
  };

  return { sendMessage, subscribe };
}
