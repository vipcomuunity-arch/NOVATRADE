/**
 * backend/server.js
 * Главный серверный файл Express + WebSocket для платформы NovaTrade.
 * Точка входа приложения: инициализация Express, WebSocket, REST API и симуляция котировок.
 */
require('dotenv').config();
const http = require('http');
const crypto = require('crypto');
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

// Импортируем наш централизованный конфиг
const config = require('./config'); 

const app = express();
const server = http.createServer(app);

// ==========================================
// 1. MIDDLEWARES БЕЗОПАСНОСТИ И БАЗОВЫЕ НАСТРОЙКИ
// ==========================================
app.use(helmet()); // Базовые заголовки безопасности
app.use(cors({
  origin: config.security.corsOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10kb' })); // Ограничение размера JSON body

// Rate Limiting (Защита от флуда)
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Слишком много запросов, повторите позже.' },
});
app.use('/v1/', limiter);

// ==========================================
// 2. ИМИТАЦИЯ БАЗЫ ДАННЫХ (IN-MEMORY STATE ДЛЯ MVP)
// ==========================================
// Примечание: В продакшене users и trades будут в PostgreSQL (Knex).
// Assets оставлены в памяти для быстрого обновления симулятором котировок.
const db = {
  users: new Map([
    ['user@novatrade.io', {
      id: crypto.randomUUID(),
      email: 'user@novatrade.io',
      passwordHash: '$2a$10$e8..', // Демо хэш (в реальности bcrypt)
      name: 'Alex Trader',
      balance: config.trading.defaultDemoBalance,
      currency: 'USD',
      isVerified: true,
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

// Маппинг для WebSocket: userId -> Set<WebSocket>
const userSockets = new Map();

// ==========================================
// 3. REST API ЭНДПОИНТЫ
// ==========================================

// Мидлвар проверки JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ message: 'Токен авторизации отсутствует' });
  }

  jwt.verify(token, config.security.jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ message: 'Недействительный или истекший токен' });
    req.user = user;
    next();
  });
};

// 3.1 Вход пользователя (Упрощенный для демо)
app.post('/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.get(email);
  
  // В реальности здесь bcrypt.compare(password, user.passwordHash)
  if (!user) {
    return res.status(400).json({ message: 'Неверный email или пароль' });
  }

  const accessToken = jwt.sign(
    { id: user.id, email: user.email }, 
    config.security.jwtSecret, 
    { expiresIn: config.security.jwtExpiresIn }
  );

  return res.json({
    accessToken,
    refreshToken: 'ref_' + crypto.randomUUID(), // Заглушка для refresh token
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      balance: user.balance,
      currency: user.currency,
    },
  });
});

// 3.2 Проверка текущего пользователя
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
  
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
  if (user.balance < amount) {
    return res.status(400).json({ message: 'Недостаточно средств на балансе' });
  }
  
  const asset = db.assets.find(a => a.id === assetId);
  if (!asset) return res.status(400).json({ message: 'Актив не найден' });

  // Валидация суммы сделки
  if (amount < config.trading.minBetAmount || amount > config.trading.maxBetAmount) {
    return res.status(400).json({ message: `Сумма сделки должна быть от ${config.trading.minBetAmount} до ${config.trading.maxBetAmount}` });
  }

  // Списываем баланс
  user.balance -= Number(amount);

  const tradeId = crypto.randomUUID();
  const now = Date.now();
  const expireAt = now + (durationSec || 60) * 1000;

  const newTrade = {
    id: tradeId,
    userId: user.id,
    assetId: asset.id,
    direction: direction.toUpperCase(),
    entryPrice: asset.price,
    amount: Number(amount),
    payout: asset.payout,
    createdAt: now,
    expireAt,
    status: 'ACTIVE',
  };

  db.activeTrades.set(tradeId, newTrade);

  // Запуск таймера закрытия сделки (В продакшене это должна делать очередь типа BullMQ/Redis)
  setTimeout(() => closeTrade(tradeId), (durationSec || 60) * 1000);

  // Оповещаем клиента об обновлении баланса через WS
  broadcastToUser(user.id, 'balance_update', { balance: user.balance });

  res.json({ success: true, trade: newTrade });
});

// ==========================================
// 4. WEBSOCKET УПРАВЛЕНИЕ И LIVE-КОТИРОВКИ
// ==========================================
const wss = new WebSocket.Server({ server, path: config.websocket.path });

wss.on('connection', (ws, req) => {
  ws.isAlive = true;
  
  // В реальном приложении здесь будет авторизация WS по токену из query-параметра
  // Пока что просто добавляем в общий список
  ws.on('pong', () => { ws.isAlive = true; });
  
  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      if (parsed.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
      // Здесь можно обработать подписку на конкретные активы
    } catch (err) {
      console.error('[WS Error] Ошибка обработки сообщения:', err.message);
    }
  });

  ws.on('close', () => {
    // Удаляем сокет из маппинга пользователя при отключении
    for (const [userId, sockets] of userSockets.entries()) {
      if (sockets.has(ws)) {
        sockets.delete(ws);
        if (sockets.size === 0) userSockets.delete(userId);
        break;
      }
    }
  });
});

// Пингование всех подключений (Heartbeat)
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, config.websocket.pingIntervalMs);

// Генератор движения цен (Тиковая симуляция котировок)
setInterval(() => {
  db.assets.forEach((asset) => {
    // Случайное блуждание цены с учетом волатильности из конфига
    const delta = (Math.random() - 0.49) * (asset.price * config.websocket.volatilityFactor);
    asset.price = parseFloat((asset.price + delta).toFixed(5));

    const updatePayload = JSON.stringify({
      type: 'quote_update',
      payload: {
        symbol: asset.id,
        price: asset.price,
        timestamp: Date.now(),
      }
    });

    // Отправляем новую цену всем подключенным вебсокет-клиентам
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(updatePayload);
      }
    });
  });
}, config.websocket.quoteTickRateMs);

// ==========================================
// 5. ЛОГИКА ЗАКРЫТИЯ СДЕЛОК
// ==========================================
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
    // При выигрыше возвращаем тело депозита + профит
    profit = trade.amount + (trade.amount * (trade.payout / 100));
    if (user) user.balance += profit;
  } 
  // При проигрыше profit = 0 (ставка уже списана при открытии)

  trade.exitPrice = currentPrice;
  trade.closedAt = Date.now();
  trade.status = isWin ? 'WIN' : 'LOSS';
  trade.profit = profit;

  db.activeTrades.delete(tradeId);
  db.tradeHistory.unshift(trade);

  // Уведомление через WS ТОЛЬКО конкретному пользователю
  if (user) {
    broadcastToUser(user.id, 'trade_closed', {
      trade,
      newBalance: user.balance,
    });
  }
}

// Функция отправки сообщения конкретному пользователю
function broadcastToUser(userId, type, payload) {
  const data = JSON.stringify({ type, payload });
  const userSocketsSet = userSockets.get(userId);
  
  if (userSocketsSet) {
    userSocketsSet.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
}

// ==========================================
// 6. ГЛОБАЛЬНЫЙ ОБРАБОТЧИК ОШИБОК
// ==========================================
// Обработка 404
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Маршрут не найден' });
});

// Глобальный обработчик ошибок Express
app.use((err, req, res, next) => {
  console.error(`[SERVER ERROR] ${err.message}`, err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: config.isProduction ? 'Внутренняя ошибка сервера' : err.message,
  });
});

// ==========================================
// 7. ЗАПУСК СЕРВЕРА
// ==========================================
server.listen(config.port, () => {
  console.log(`=================================`);
  console.log(`🚀 NovaTrade API запущен на порту: ${config.port}`);
  console.log(`🌍 Окружение: ${config.env}`);
  console.log(`📡 WebSocket URL: ws://localhost:${config.port}${config.websocket.path}`);
  console.log(`=================================`);
});
