/**
 * backend/src/server.js
 * 
 * Главный серверный файл Express + WebSocket для платформы NovaTrade.
 * Обрабатывает REST API запросы, авторизацию, реальные котировки и автозакрытие сделок.
 */

require('dotenv').config();
const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'novatrade_super_secret_key_2026';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

// ==========================================
// 1. MIDDLEWARES БЕЗОПАСНОСТИ И КОНФИГУРАЦИЯ
// ==========================================
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());

// Ограничение количества запросов (Rate Limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 300, // максимум 300 запросов с одного IP
  message: { status: 'error', message: 'Слишком много запросов, повторите позже.' },
});
app.use('/v1/', limiter);

// ==========================================
// 2. ИМИТАЦИЯ БАЗЫ ДАННЫХ (IN-MEMORY STATE)
// ==========================================
const db = {
  users: new Map([
    ['user@novatrade.io', {
      id: 'usr_demo123',
      email: 'user@novatrade.io',
      passwordHash: '$2a$10$e8..', // демо хэш
      name: 'Alex Trader',
      balance: 10000.00,
      currency: 'USD',
      verified: true,
    }]
  ]),
  assets: [
    { id: 'EURUSD', name: 'EUR / USD', category: 'Forex', price: 1.08500, payout: 85 },
    { id: 'GBPUSD', name: 'GBP / USD', category: 'Forex', price: 1.26420, payout: 82 },
    { id: 'BTCUSD', name: 'Bitcoin', category: 'Crypto', price: 67450.00, payout: 90 },
    { id: 'ETHUSD', name: 'Ethereum', category: 'Crypto', price: 3520.50, payout: 88 },
  ],
  activeTrades: new Map(), // tradeId -> Trade object
  tradeHistory: [],
};

// ==========================================
// 3. REST API ЭНДПОИНТЫ
// ==========================================

// Мидлвар проверки JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Токен авторизации отсутствует' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: 'Недействительный токен' });
    req.user = user;
    next();
  });
};

// 3.1 Вход пользователя
app.post('/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.get(email);

  if (!user) {
    return res.status(400).json({ message: 'Неверный email или пароль' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

  return res.json({
    accessToken: token,
    refreshToken: 'ref_' + Math.random().toString(36).substr(2),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      balance: user.balance,
      currency: user.currency,
    },
  });
});

// 3.2 Проверка текущего пользователя и баланса
app.get('/v1/auth/me', authenticateToken, (req, res) => {
  const user = Array.from(db.users.values()).find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    balance: user.balance,
    currency: user.currency,
  });
});

// 3.3 Получить список торговых активов
app.get('/v1/trading/assets', authenticateToken, (req, res) => {
  res.json(db.assets);
});

// 3.4 Открытие новой сделки (CALL / PUT)
app.post('/v1/trading/trades', authenticateToken, (req, res) => {
  const { assetId, direction, amount, durationSec } = req.body;
  const user = Array.from(db.users.values()).find(u => u.id === req.user.id);

  if (!user || user.balance < amount) {
    return res.status(400).json({ message: 'Недостаточно средств на балансе' });
  }

  const asset = db.assets.find(a => a.id === assetId);
  if (!asset) {
    return res.status(400).json({ message: 'Актив не найден' });
  }

  // Списываем баланс
  user.balance -= Number(amount);

  const tradeId = 'trd_' + Math.random().toString(36).substr(2, 9);
  const now = Date.now();
  const expireAt = now + (durationSec || 60) * 1000;

  const newTrade = {
    id: tradeId,
    userId: user.id,
    assetId: asset.id,
    direction: direction.toUpperCase(), // 'UP' или 'DOWN'
    entryPrice: asset.price,
    amount: Number(amount),
    payout: asset.payout,
    createdAt: now,
    expireAt,
    status: 'ACTIVE',
  };

  db.activeTrades.set(tradeId, newTrade);

  // Запуск таймера закрытия сделки
  setTimeout(() => closeTrade(tradeId), (durationSec || 60) * 1000);

  // Оповещаем клиента об обновлении баланса
  broadcastToUser(user.id, 'balance_update', { balance: user.balance });

  res.json({ success: true, trade: newTrade });
});

// ==========================================
// 4. WEBSOCKET УПРАВЛЕНИЕ И LIVE-КОТИРОВКИ
// ==========================================

const clients = new Set();

wss.on('connection', (ws, req) => {
  clients.add(ws);
  ws.isAlive = true;

  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      if (parsed.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (err) {
      console.error('[WS Error] Ошибка обработки сообщения:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// Пингование всех подключений каждые 30 секунд
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Генератор движения цен (Тиковая симуляция котировок)
setInterval(() => {
  db.assets.forEach((asset) => {
    const delta = (Math.random() - 0.49) * (asset.price * 0.0008);
    asset.price = parseFloat((asset.price + delta).toFixed(5));

    // Отправляем новую цену всем подключенным вебсокет-клиентам
    const updatePayload = JSON.stringify({
      type: 'quote_update',
      payload: {
        symbol: asset.id,
        price: asset.price,
        timestamp: Date.now(),
      }
    });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(updatePayload);
      }
    });
  });
}, 1000);

// Закрытие сделки и расчет профита
function closeTrade(tradeId) {
  const trade = db.activeTrades.get(tradeId);
  if (!trade) return;

  const asset = db.assets.find(a => a.id === trade.assetId);
  const currentPrice = asset ? asset.price : trade.entryPrice;
  const user = Array.from(db.users.values()).find(u => u.id === trade.userId);

  let isWin = false;
  if (trade.direction === 'UP' && currentPrice > trade.entryPrice) isWin = true;
  if (trade.direction === 'DOWN' && currentPrice < trade.entryPrice) isWin = true;

  let profit = 0;
  if (isWin) {
    profit = trade.amount + (trade.amount * (trade.payout / 100));
    if (user) user.balance += profit;
  }

  trade.exitPrice = currentPrice;
  trade.closedAt = Date.now();
  trade.status = isWin ? 'WIN' : 'LOSS';
  trade.profit = profit;

  db.activeTrades.delete(tradeId);
  db.tradeHistory.unshift(trade);

  // Уведомление через WS о закрытии сделки
  if (user) {
    broadcastToUser(user.id, 'trade_closed', {
      trade,
      newBalance: user.balance,
    });
  }
}

function broadcastToUser(userId, type, payload) {
  const data = JSON.stringify({ type, payload });
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// ==========================================
// 5. ЗАПУСК СЕРВЕРА
// ==========================================
server.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 NovaTrade API запущен на порту: ${PORT}`);
  console.log(`📡 WebSocket URL: ws://localhost:${PORT}/ws`);
  console.log(`=================================`);
});
