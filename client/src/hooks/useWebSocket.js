import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = import.meta.env.PROD
  ? `wss://${window.location.host}/ws`
  : 'ws://localhost:5000/ws';

export function useWebSocket(userId) {
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [prices, setPrices] = useState({});
  const [alerts, setAlerts] = useState([]);
  const listeners = useRef(new Map());

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    try {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);

        // Authenticate if userId provided
        if (userId) {
          ws.current.send(JSON.stringify({ type: 'auth', userId }));
        }

        // Resubscribe to symbols
        const subscribedSymbols = Object.keys(prices);
        if (subscribedSymbols.length > 0) {
          ws.current.send(JSON.stringify({
            type: 'subscribe',
            symbols: subscribedSymbols
          }));
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);

        // Auto-reconnect after 3 seconds
        reconnectTimeout.current = setTimeout(connect, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);

          // Handle different message types
          switch (message.type) {
            case 'price_update':
              setPrices(prev => ({
                ...prev,
                [message.symbol]: {
                  price: message.price,
                  change: message.change,
                  changePercent: message.changePercent,
                  high: message.high,
                  low: message.low,
                  volume: message.volume,
                  timestamp: message.timestamp
                }
              }));
              break;

            case 'alert_triggered':
              setAlerts(prev => [...prev, message.alert]);
              // Show browser notification
              if (Notification.permission === 'granted') {
                new Notification(`Price Alert: ${message.alert.symbol}`, {
                  body: `${message.alert.symbol} is now ${message.alert.condition} $${message.alert.targetPrice}`,
                  icon: '/logo.png'
                });
              }
              break;

            case 'alerts_list':
              setAlerts(message.alerts);
              break;

            case 'trade_update':
              // Emit to listeners
              listeners.current.get('trade_update')?.forEach(cb => cb(message.trade));
              break;

            case 'pnl_update':
              listeners.current.get('pnl_update')?.forEach(cb => cb(message));
              break;
          }

          // Emit to all listeners for this message type
          listeners.current.get(message.type)?.forEach(cb => cb(message));
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
    }
  }, [userId, prices]);

  useEffect(() => {
    connect();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const subscribe = useCallback((symbols) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'subscribe',
        symbols: Array.isArray(symbols) ? symbols : [symbols]
      }));
    }
  }, []);

  const unsubscribe = useCallback((symbols) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'unsubscribe',
        symbols: Array.isArray(symbols) ? symbols : [symbols]
      }));
    }
  }, []);

  const setAlert = useCallback((symbol, condition, price) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'set_alert',
        symbol,
        condition,
        price
      }));
    }
  }, []);

  const removeAlert = useCallback((alertId) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'remove_alert',
        alertId
      }));
    }
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const getAlerts = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'get_alerts' }));
    }
  }, []);

  const addListener = useCallback((type, callback) => {
    if (!listeners.current.has(type)) {
      listeners.current.set(type, new Set());
    }
    listeners.current.get(type).add(callback);

    return () => {
      listeners.current.get(type)?.delete(callback);
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    prices,
    alerts,
    subscribe,
    unsubscribe,
    setAlert,
    removeAlert,
    getAlerts,
    addListener
  };
}

// Hook for subscribing to specific symbols
export function useRealTimePrice(symbols) {
  const { prices, subscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (isConnected && symbols?.length > 0) {
      subscribe(symbols);
    }
  }, [isConnected, symbols, subscribe]);

  return prices;
}
