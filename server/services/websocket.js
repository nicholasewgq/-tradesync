// WebSocket Service for Real-Time Updates
import { WebSocketServer } from 'ws';

let wss = null;
const clients = new Map(); // userId -> Set of WebSocket connections
const priceAlerts = new Map(); // alertId -> { userId, symbol, condition, price, triggered }

export function initWebSocket(server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');

    ws.isAlive = true;
    ws.userId = null;
    ws.subscriptions = new Set();

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleMessage(ws, message);
      } catch (err) {
        console.error('WebSocket message parse error:', err);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      if (ws.userId && clients.has(ws.userId)) {
        clients.get(ws.userId).delete(ws);
        if (clients.get(ws.userId).size === 0) {
          clients.delete(ws.userId);
        }
      }
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err);
    });
  });

  // Heartbeat to detect dead connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  // Start price update simulation (in production, connect to real data feeds)
  startPriceUpdates();

  return wss;
}

function handleMessage(ws, message) {
  switch (message.type) {
    case 'auth':
      // Authenticate user
      ws.userId = message.userId;
      if (!clients.has(ws.userId)) {
        clients.set(ws.userId, new Set());
      }
      clients.get(ws.userId).add(ws);
      ws.send(JSON.stringify({ type: 'auth_success', userId: ws.userId }));
      break;

    case 'subscribe':
      // Subscribe to symbols
      if (Array.isArray(message.symbols)) {
        message.symbols.forEach(s => ws.subscriptions.add(s.toUpperCase()));
      }
      ws.send(JSON.stringify({
        type: 'subscribed',
        symbols: Array.from(ws.subscriptions)
      }));
      break;

    case 'unsubscribe':
      if (Array.isArray(message.symbols)) {
        message.symbols.forEach(s => ws.subscriptions.delete(s.toUpperCase()));
      }
      break;

    case 'set_alert':
      // Create price alert
      const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      priceAlerts.set(alertId, {
        id: alertId,
        userId: ws.userId,
        symbol: message.symbol.toUpperCase(),
        condition: message.condition, // 'above' or 'below'
        targetPrice: message.price,
        triggered: false,
        createdAt: new Date().toISOString()
      });
      ws.send(JSON.stringify({ type: 'alert_created', alertId, ...message }));
      break;

    case 'remove_alert':
      priceAlerts.delete(message.alertId);
      ws.send(JSON.stringify({ type: 'alert_removed', alertId: message.alertId }));
      break;

    case 'get_alerts':
      const userAlerts = Array.from(priceAlerts.values())
        .filter(a => a.userId === ws.userId);
      ws.send(JSON.stringify({ type: 'alerts_list', alerts: userAlerts }));
      break;
  }
}

// Broadcast price updates to subscribed clients
export function broadcastPriceUpdate(symbol, priceData) {
  if (!wss) return;

  const message = JSON.stringify({
    type: 'price_update',
    symbol,
    ...priceData,
    timestamp: Date.now()
  });

  wss.clients.forEach((ws) => {
    if (ws.readyState === 1 && ws.subscriptions.has(symbol)) {
      ws.send(message);
    }
  });

  // Check price alerts
  checkPriceAlerts(symbol, priceData.price);
}

// Broadcast to specific user
export function broadcastToUser(userId, message) {
  if (!clients.has(userId)) return;

  const msgStr = JSON.stringify(message);
  clients.get(userId).forEach((ws) => {
    if (ws.readyState === 1) {
      ws.send(msgStr);
    }
  });
}

// Broadcast trade updates
export function broadcastTradeUpdate(userId, trade) {
  broadcastToUser(userId, {
    type: 'trade_update',
    trade
  });
}

// Broadcast P&L updates
export function broadcastPnLUpdate(userId, pnlData) {
  broadcastToUser(userId, {
    type: 'pnl_update',
    ...pnlData
  });
}

// Check and trigger price alerts
function checkPriceAlerts(symbol, currentPrice) {
  priceAlerts.forEach((alert, alertId) => {
    if (alert.triggered || alert.symbol !== symbol) return;

    let shouldTrigger = false;
    if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
      shouldTrigger = true;
    } else if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
      shouldTrigger = true;
    }

    if (shouldTrigger) {
      alert.triggered = true;
      alert.triggeredAt = new Date().toISOString();
      alert.triggeredPrice = currentPrice;

      broadcastToUser(alert.userId, {
        type: 'alert_triggered',
        alert: {
          ...alert,
          currentPrice
        }
      });
    }
  });
}

// Simulated price updates (replace with real data feed in production)
const baseP = {
  SPY: 585.50, QQQ: 505.20, AAPL: 248.50, MSFT: 445.30,
  GOOGL: 178.90, AMZN: 225.60, TSLA: 345.20, NVDA: 875.40,
  META: 565.30, AMD: 165.80, NFLX: 895.20, DIS: 112.50
};

function startPriceUpdates() {
  setInterval(() => {
    Object.entries(baseP).forEach(([symbol, basePrice]) => {
      // Simulate price movement
      const change = (Math.random() - 0.5) * basePrice * 0.002;
      baseP[symbol] = Math.max(basePrice + change, 1);

      const price = baseP[symbol];
      const dayChange = (Math.random() - 0.45) * 3;

      broadcastPriceUpdate(symbol, {
        price: parseFloat(price.toFixed(2)),
        change: parseFloat((price * dayChange / 100).toFixed(2)),
        changePercent: parseFloat(dayChange.toFixed(2)),
        high: parseFloat((price * 1.01).toFixed(2)),
        low: parseFloat((price * 0.99).toFixed(2)),
        volume: Math.floor(Math.random() * 10000000)
      });
    });
  }, 2000); // Update every 2 seconds
}

export function getConnectedClients() {
  return wss ? wss.clients.size : 0;
}
