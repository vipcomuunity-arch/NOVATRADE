/**
 * backend/routes/trades.js
 * 
 * Маршруты для управления торговыми сделками (Binary Options):
 * - Открытие сделки (CALL / PUT)
 * - Получение списка активных сделок
 * - Получение истории закрытых сделок
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, usersDb } = require('./auth');

const db = {
  assets: [
    { id: 'EURUSD', name: 'EUR / USD', category: 'Forex', price: 1.08500, payout: 85 },
    { id: 'GBPUSD', name: 'GBP / USD', category: 'Forex', price: 1.26420, payout: 82 },
    { id: 'BTCUSD', name: 'Bitcoin', category: 'Crypto', price: 67450.00, payout: 90 },
    { id: 'ETHUSD', name: 'Ethereum', category: 'Crypto', price: 3520.50, payout: 88 },
  ],
  activeTrades: new Map(),
  tradeHistory: [],
};

let broadcastUserCallback = null;
function setBroadcastCallback(fn) {
  broadcastUserCallback = fn;
}

router.post('/', authenticateToken, (req, res) => {
  try {
    const { assetId, direction, amount, durationSec } = req.body;
    const userId = req.user.id;

    if (!assetId || !direction || !amount || !durationSec) {
      return res.status(400).json({ status: 'error', message: 'Заполните все обязательные поля' });
    }

    const normalizedDirection = direction.toUpperCase();
    if (!['UP', 'DOWN', 'CALL', 'PUT'].includes(normalizedDirection)) {
      return res.status(400).json({ status: 'error', message: 'Неверное направление сделки' });
    }

    const tradeDirection = (normalizedDirection === 'CALL') ? 'UP' : (normalizedDirection === 'PUT') ? 'DOWN' : normalizedDirection;
    const numAmount = Number(amount);
    const numDuration = Number(durationSec);

    if (isNaN(numAmount) || numAmount <= 0 || isNaN(numDuration) || numDuration < 5) {
      return res.status(400).json({ status: 'error', message: 'Некорректная сумма или время экспирации' });
    }

    const user = Array.from(usersDb.values()).find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Пользователь не найден' });
    }

    if (user.balance < numAmount) {
      return res.status(400).json({ status: 'error', message: 'Недостаточно средств на балансе' });
    }

    const asset = db.assets.find(a => a.id === assetId);
    if (!asset) {
      return res.status(400).json({ status: 'error', message: 'Торговый актив не найден' });
    }

    user.balance = Number((user.balance - numAmount).toFixed(2));
    usersDb.set(user.email, user);

    const tradeId = 'trd_' + Math.random().toString(36).substring(2, 11);
    const now = Date.now();
    const expireAt = now + (numDuration * 1000);

    const newTrade = {
      id: tradeId,
      userId: user.id,
      assetId: asset.id,
      assetName: asset.name,
      direction: tradeDirection,
      entryPrice: asset.price,
      amount: numAmount,
      payout: asset.payout,
      createdAt: now,
      expireAt,
      status: 'ACTIVE',
    };

    db.activeTrades.set(tradeId, newTrade);

    setTimeout(() => {
      resolveTrade(tradeId);
    }, numDuration * 1000);

    if (broadcastUserCallback) {
      broadcastUserCallback(user.id, 'balance_update', { balance: user.balance });
      broadcastUserCallback(user.id, 'trade_opened', { trade: newTrade });
    }

    res.status(201).json({
      status: 'success',
      message: 'Сделка успешно открыта',
      trade: newTrade,
      newBalance: user.balance,
    });
  } catch (error) {
    console.error('[Open Trade Error]:', error);
    res.status(500).json({ status: 'error', message: 'Внутренняя ошибка сервера' });
  }
});

router.get('/active', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const userActiveTrades = [];
    db.activeTrades.forEach((trade) => {
      if (trade.userId === userId) userActiveTrades.push(trade);
    });
    res.json({ status: 'success', trades: userActiveTrades });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Ошибка при получении активных сделок' });
  }
});

router.get('/history', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 50;
    const userHistory = db.tradeHistory.filter(t => t.userId === userId).slice(0, limit);
    res.json({ status: 'success', trades: userHistory });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Ошибка при получении истории сделок' });
  }
});

function resolveTrade(tradeId) {
  const trade = db.activeTrades.get(tradeId);
  if (!trade) return;

  const asset = db.assets.find(a => a.id === trade.assetId);
  const currentPrice = asset ? asset.price : trade.entryPrice;
  const user = Array.from(usersDb.values()).find(u => u.id === trade.userId);

  let isWin = false;
  if (trade.direction === 'UP' && currentPrice > trade.entryPrice) isWin = true;
  if (trade.direction === 'DOWN' && currentPrice < trade.entryPrice) isWin = true;

  let profit = 0;
  if (isWin) {
    profit = Number((trade.amount + (trade.amount * (trade.payout / 100))).toFixed(2));
    if (user) {
      user.balance = Number((user.balance + profit).toFixed(2));
      usersDb.set(user.email, user);
    }
  } else if (currentPrice === trade.entryPrice) {
    profit = trade.amount;
    if (user) {
      user.balance = Number((user.balance + profit).toFixed(2));
      usersDb.set(user.email, user);
    }
  }

  trade.exitPrice = currentPrice;
  trade.closedAt = Date.now();
  trade.status = (currentPrice === trade.entryPrice) ? 'DRAW' : (isWin ? 'WIN' : 'LOSS');
  trade.profit = profit;

  db.activeTrades.delete(tradeId);
  db.tradeHistory.unshift(trade);

  if (user && broadcastUserCallback) {
    broadcastUserCallback(user.id, 'trade_closed', {
      trade,
      newBalance: user.balance,
    });
  }
}

module.exports = router;
module.exports.db = db;
module.exports.setBroadcastCallback = setBroadcastCallback;
