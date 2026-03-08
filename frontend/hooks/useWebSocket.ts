'use client';

import { useEffect, useRef, useCallback } from 'react';
import { type Message, WS_BASE } from '@/lib/api';

interface UseWebSocketOptions {
  roomId: number | null;
  onMessage: (msg: Message) => void;
}

export function useWebSocket({ roomId, onMessage }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);

  // Обновляем ref при каждом рендере чтобы не было stale closure
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!roomId) return;

    // Закрываем старое соединение
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const ws = new WebSocket(`${WS_BASE}/ws/${roomId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg: Message = JSON.parse(event.data);
        onMessageRef.current(msg);
      } catch {
        console.error('WS parse error:', event.data);
      }
    };

    ws.onerror = (e) => console.error('WS error:', e);

    ws.onclose = () => {
      console.log(`WS closed for room ${roomId}`);
    };

    // Cleanup при смене комнаты или unmount
    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomId]);

  // Отправка сообщения
  const sendMessage = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WS not open');
      return;
    }
    wsRef.current.send(JSON.stringify({ text }));
  }, []);

  return { sendMessage };
}