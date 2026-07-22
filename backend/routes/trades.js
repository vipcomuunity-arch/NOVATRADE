/**
 * backend/routes/trades.js
 * Маршруты для управления торговыми сделками (Binary Options).
 * Использует транзакции БД для гарантии целостности баланса и EventEmitter 
 * для безопасной отправки событий в WebSocket.
 */
const express = require('express');
const router = express.Router();
const knex = require('knex');
const { EventEmitter } = require('events');

const config = require('../config');
const { authenticateToken } = require('./auth');

// Инициализация БД и шины событий для WebSocket
const db = knex(config.db);
const tradeEvents = new EventEmitter();

// Хелпер для отправки событий в WS (server.js будет слушать 'ws_send')
const broadcastToUser = (userId, type, payload) => {
  tradeEvents.emit('ws_send', { userId, type, payload });
};

// ==========================================
// 1. ОТКРЫТИЕ НОВОЙ СДЕЛКИ (CALL / PUT)
// ==========================================
router.post('/', authenticateToken, async (req, res) => {
  // Используем транзакцию для гарантии атомарности (защита от race conditions)
  await db.transaction(async (trx) => {
    try {
      const { assetId, direction, amount, durationSec } = req.body;
      const userId = req.user.id;

      // 1. Базовая валидация
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

      // 2. Валидация по глобальному конфигу
      if (numAmount < config.trading.minBetAmount || numAmount > config.trading.maxBetAmount) {
        return res.status(400).json({ 
          status: 'error', 
          message: `Сумма сделки должна быть от $${config.trading.minBetAmount} до $${config.trading.maxBetAmount}` 
        });
      }
      if (!config.trading.allowedDurationsSec.includes(numDuration)) {
        return res.status(400).json({ 
          status: 'error', 
          message: `Недопустимое время экспирации. Разрешено: ${config.trading.allowedDurationsSec.join(', ')} сек` 
        });
      }

      // 3. Блокировка строки пользователя и проверка баланса (FOR UPDATE)
      const user = await trx('users')
        .where({ id: userId })
        .select('id', 'balance')
        .forUpdate() // Блокируем строку до конца транзакции
        .first();

      if (!user) {
        return res.status(404).json({ status: 'error', message: 'Пользователь не найден' });
      }
      if (user.balance < numAmount) {
        return res.status(400).json({ status: 'error', message: 'Недостаточно средств на балансе' });
      }

      // 4. Проверка актива (должен быть активен)
      const asset = await trx('assets').where({ id: assetId, is_active: true }).first();
      if (!asset) {
        return res.status(400).json({ status: 'error', message: 'Актив не найден или торги по нему закрыты' });
      }

      // 5. Списываем баланс
      await trx('users').where({ id: userId }).decrement('balance', numAmount);

      // 6. Создаем сделку (ID генерируется в БД через gen_random_uuid())
      const now = new Date();
      const expireAt = new Date(now.getTime() + numDuration * 1000);

      const [newTrade] = await trx('trades')
        .insert({
          user_id: userId,
          asset_id: asset.id,
          direction: tradeDirection,
          entry_price: asset.price,
          amount: numAmount,
          payout: asset.payout,
          status: 'ACTIVE',
          expire_at: expireAt,
        })
        .returning('*');

      // 7. Запуск таймера закрытия (MVP)
      // TODO: В продакшене заменить на очередь (BullMQ/Redis) или cron, чтобы не терять сделки при рестарте
      setTimeout(() => resolveTrade(newTrade.id), numDuration * 1000);

      // 8. Уведомления через WebSocket
      const updatedUser = await trx('users').where({ id: userId }).select('balance').first();
      broadcastToUser(userId, 'balance_update', { balance: updatedUser.balance });
      broadcastToUser(userId, 'trade_opened', { trade: newTrade });

      res.status(201).json({
        status: 'success',
        message: 'Сделка успешно открыта',
        trade: newTrade,
        newBalance: updatedUser.balance,
      });

    } catch (error) {
      console.error('[Open Trade Error]:', error.message);
      // Транзакция автоматически откатится (rollback), если мы не вернули res до этого
      if (!res.headersSent) {
        res.status(500).json({ status: 'error', message: 'Внутренняя ошибка сервера при открытии сделки' });
      }
    }
  });
});

// ==========================================
// 2. ПОЛУЧЕНИЕ АКТИВНЫХ СДЕЛОК
// ==========================================
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const activeTrades = await db('trades')
      .where({ user_id: req.user.id, status: 'ACTIVE' })
      .orderBy('created_at', 'desc');

    res.json({ status: 'success', trades: activeTrades });
  } catch (error) {
    console.error('[Get Active Trades Error]:', error.message);
    res.status(500).json({ status: 'error', message: 'Ошибка при получении активных сделок' });
  }
});

// ==========================================
// 3. ПОЛУЧЕНИЕ ИСТОРИИ СДЕЛОК
// ==========================================
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    
    const history = await db('trades')
      .where({ user_id: req.user.id })
      .whereIn('status', ['WIN', 'LOSS', 'DRAW'])
      .orderBy('closed_at', 'desc')
      .limit(limit);

    res.json({ status: 'success', trades: history });
  } catch (error) {
    console.error('[Get Trade History Error]:', error.message);
    res.status(500).json({ status: 'error', message: 'Ошибка при получении истории сделок' });
  }
});

// ==========================================
// 4. ЛОГИКА ЗАКРЫТИЯ СДЕЛКИ (RESOLVE)
// ==========================================
async function resolveTrade(tradeId) {
  await db.transaction(async (trx) => {
    try {
      // 1. Получаем сделку и блокируем её
      const trade = await trx('trades').where({ id: tradeId, status: 'ACTIVE' }).forUpdate().first();
      if (!trade) return; // Уже закрыта или не найдена

      // 2. Получаем текущую цену актива из БД
      const asset = await trx('assets').where({ id: trade.asset_id }).first();
      const currentPrice = asset ? asset.price : trade.entry_price;

      // 3. Определяем результат
      let status = 'LOSS';
      let profit = 0;

      if (currentPrice === trade.entry_price) {
        status = 'DRAW';
        profit = trade.amount; // Возврат тела депозита
      } else {
        const isWin = (trade.direction === 'UP' && currentPrice > trade.entry_price) ||
                      (trade.direction === 'DOWN' && currentPrice < trade.entry_price);
        
        if (isWin) {
          status = 'WIN';
          profit = Number((trade.amount + (trade.amount * (trade.payout / 100))).toFixed(2));
        }
      }

      // 4. Обновляем сделку
      await trx('trades').where({ id: tradeId }).update({
        status,
        exit_price: currentPrice,
        profit,
        closed_at: new Date(),
      });

      // 5. Если WIN или DRAW, начисляем средства обратно на баланс
      if (status === 'WIN' || status === 'DRAW') {
        await trx('users').where({ id: trade.user_id }).increment('balance', profit);
      }

      // 6. Получаем новый баланс для уведомления
      const updatedUser = await trx('users').where({ id: trade.user_id }).select('balance').first();
      
      const closedTrade = { ...trade, status, exit_price: currentPrice, profit, closed_at: new Date() };

      // 7. Уведомляем клиента через WS
      broadcastToUser(trade.user_id, 'trade_closed', {
        trade: closedTrade,
        newBalance: updatedUser.balance,
      });

    } catch (error) {
      console.error(`[Resolve Trade ${tradeId} Error]:`, error.message);
    }
  });
}

// ==========================================
// ЭКСПОРТ
// ==========================================
module.exports = router;
module.exports.tradeEvents = tradeEvents; // Экспортируем шину событий для server.js
module.exports.resolveTrade = resolveTrade; // Экспортируем для возможного вызова из cron/worker
