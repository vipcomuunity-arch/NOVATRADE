/**
 * backend/routes/users.js
 * Маршруты управления профилем пользователя, сброса демо-баланса,
 * расчета торговой статистики и смены пароля.
 * Работает с реальной базой данных PostgreSQL через Knex.js.
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const knex = require('knex');

// Импортируем централизованный конфиг и мидлвар авторизации
const config = require('../config');
const { authenticateToken } = require('./auth');

// Инициализация Knex (в идеале вынести в backend/db.js для переиспользования пула)
const db = knex(config.db);

// ==========================================
// 1. ПОЛУЧЕНИЕ ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ
// ==========================================
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('id', 'email', 'name', 'avatar', 'balance', 'currency', 'is_verified', 'created_at')
      .first();

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Пользователь не найден' });
    }

    res.json({
      status: 'success',
      user,
    });
  } catch (error) {
    console.error('[User Profile Error]:', error.message);
    res.status(500).json({ status: 'error', message: 'Ошибка при получении профиля' });
  }
});

// ==========================================
// 2. ОБНОВЛЕНИЕ ДАННЫХ ПРОФИЛЯ
// ==========================================
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updateData = {};

    // Валидация и подготовка данных
    if (name !== undefined) {
      const trimmedName = name.trim();
      if (trimmedName.length < 2 || trimmedName.length > 100) {
        return res.status(400).json({ status: 'error', message: 'Имя должно содержать от 2 до 100 символов' });
      }
      updateData.name = trimmedName;
    }

    if (avatar !== undefined) {
      if (typeof avatar !== 'string' || avatar.length > 2000) {
        return res.status(400).json({ status: 'error', message: 'Некорректный формат аватара' });
      }
      updateData.avatar = avatar;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ status: 'error', message: 'Нет данных для обновления' });
    }

    // Обновление в БД
    const [updatedUser] = await db('users')
      .where({ id: req.user.id })
      .update(updateData)
      .returning(['id', 'email', 'name', 'avatar', 'balance', 'currency']);

    if (!updatedUser) {
      return res.status(404).json({ status: 'error', message: 'Пользователь не найден' });
    }

    res.json({
      status: 'success',
      message: 'Профиль успешно обновлен',
      user: updatedUser,
    });
  } catch (error) {
    console.error('[User Profile Update Error]:', error.message);
    res.status(500).json({ status: 'error', message: 'Ошибка при обновлении профиля' });
  }
});

// ==========================================
// 3. СБРОС / ПОПОЛНЕНИЕ ДЕМО-БАЛАНСА
// ==========================================
router.post('/reset-demo', authenticateToken, async (req, res) => {
  try {
    const defaultBalance = config.trading.defaultDemoBalance;

    const [updatedUser] = await db('users')
      .where({ id: req.user.id })
      .update({ balance: defaultBalance })
      .returning(['id', 'balance']);

    if (!updatedUser) {
      return res.status(404).json({ status: 'error', message: 'Пользователь не найден' });
    }

    res.json({
      status: 'success',
      message: `Демо-баланс успешно пополнен до $${defaultBalance}`,
      newBalance: updatedUser.balance,
    });
  } catch (error) {
    console.error('[User Reset Demo Error]:', error.message);
    res.status(500).json({ status: 'error', message: 'Ошибка при сбросе баланса' });
  }
});

// ==========================================
// 4. ТОРГОВАЯ СТАТИСТИКА ПОЛЬЗОВАТЕЛЯ (SQL AGGREGATION)
// ==========================================
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Используем мощь SQL для расчета статистики. 
    // Это в разы быстрее, чем выгружать все сделки в Node.js и считать их в цикле.
    const stats = await db('trades')
      .where({ user_id: req.user.id })
      .whereIn('status', ['WIN', 'LOSS', 'DRAW']) // Считаем только закрытые сделки
      .select(
        db.raw('COUNT(*) as total_trades'),
        db.raw("COUNT(CASE WHEN status = 'WIN' THEN 1 END) as winning_trades"),
        db.raw("COUNT(CASE WHEN status = 'LOSS' THEN 1 END) as losing_trades"),
        db.raw('COALESCE(SUM(amount), 0) as total_volume'),
        // Net profit: при выигрыше profit включает тело депозита, поэтому вычитаем amount. При проигрыше profit = 0, значит чистый убыток = -amount.
        db.raw("COALESCE(SUM(CASE WHEN status = 'WIN' THEN (profit - amount) ELSE -amount END), 0) as net_profit")
      )
      .first();

    const totalTrades = parseInt(stats.total_trades, 10);
    const winningTrades = parseInt(stats.winning_trades, 10);
    const winRate = totalTrades > 0 ? parseFloat(((winningTrades / totalTrades) * 100).toFixed(1)) : 0;

    res.json({
      status: 'success',
      stats: {
        totalTrades,
        winningTrades,
        losingTrades: parseInt(stats.losing_trades, 10),
        winRate: `${winRate}%`,
        totalVolume: parseFloat(stats.total_volume),
        netProfit: parseFloat(stats.net_profit),
      },
    });
  } catch (error) {
    console.error('[User Stats Error]:', error.message);
    res.status(500).json({ status: 'error', message: 'Ошибка при получении статистики' });
  }
});

// ==========================================
// 5. СМЕНА ПАРОЛЯ
// ==========================================
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ status: 'error', message: 'Укажите текущий и новый пароли' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ status: 'error', message: 'Новый пароль должен содержать минимум 6 символов' });
    }

    // 1. Получаем текущий хэш пароля из БД
    const user = await db('users').where({ id: req.user.id }).select('password_hash').first();
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Пользователь не найден' });
    }

    // 2. Проверяем текущий пароль
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ status: 'error', message: 'Текущий пароль указан неверно' });
    }

    // 3. Хэшируем новый пароль и обновляем в БД
    const newPasswordHash = await bcrypt.hash(newPassword, config.security.bcryptSaltRounds);
    
    await db('users')
      .where({ id: req.user.id })
      .update({ password_hash: newPasswordHash });

    res.json({
      status: 'success',
      message: 'Пароль успешно изменен',
    });
  } catch (error) {
    console.error('[User Change Password Error]:', error.message);
    res.status(500).json({ status: 'error', message: 'Ошибка при смене пароля' });
  }
});

// ==========================================
// ЭКСПОРТ
// ==========================================
module.exports = router;
