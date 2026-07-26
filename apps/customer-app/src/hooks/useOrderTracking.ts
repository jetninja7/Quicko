import { useEffect, useRef, useState } from 'react';

interface OrderUpdate {
  orderId: string;
  status: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  timestamp: string;
}

export function useOrderTracking(orderId: string, token: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<OrderUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!orderId || !token) return;

    function connect() {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
      const ws = new WebSocket(`${wsUrl}/ws`);

      ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        setIsConnected(true);
        setError(null);

        ws.send(
          JSON.stringify({
            type: 'auth',
            token,
            orderId,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'authenticated') {
            console.log('✅ WebSocket authenticated');
          } else if (data.type === 'order_update') {
            console.log('📦 Order update received:', data.data);
            setLastUpdate(data.data);
          } else if (data.type === 'error') {
            console.error('WebSocket error:', data.message);
            setError(data.message);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);

        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Reconnecting...');
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    }

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [orderId, token]);

  return { isConnected, lastUpdate, error };
}
