/**
 * backend/routes/users.js
 * 
 * Маршруты управления профилем пользователя, сброса демо-баланса,
 * расчета торговой статистики и смены пароля.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Импорт мидлвара авторизации и базы пользователей из auth.js
const { authenticateToken, usersDb } = require('./auth');

// Имитация базы истории сделок для расчета статистики (если не подключена БД)
const tradeHistoryDb = [];

// ==========================================
// 1. ПОЛУЧЕНИЕ ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ
// ==========================================
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = Array.from(usersDb.values()).find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Пользователь не найден' });
    }

    res.json({
      status: 'success',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar || null,
        balance: user.balance,
        currency: user.currency || 'USD',
        isVerified: user.verified || false,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[User Profile Error]:', error);
    res.status(500).json({ status: 'error', message: 'Ошибка при получении профиля' });
  }
});

// ==========================================
// 2. ОБНОВЛЕНИЕ ДАННЫХ ПРОФИЛЯ
// ==========================================
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = Array.from(usersDb.values()).find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Пользователь не найден' });
    }

    if (name) user.name = name.trim();
    if (avatar) user.avatar = avatar;

    usersDb.set(user.email, user);

    res.json({
      status: 'success',
      message: 'Профиль успешно обновлен',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        balance: user.balance,
        currency: user.currency,
      },
    });
  } catch (error) {
    console.error('[User Profile Update Error]:', error);
    res.status(500).json({ status: 'error', message: 'Ошибка при обновлении профиля' });
  }
});

// ==========================================
// 3. СБРОС / ПОПОЛНЕНИЕ ДЕМО-БАЛАНСА ($10,000)
// ==========================================
router.post('/reset-demo', authenticateToken, (req, res) => {
  try {
    const user = Array.from(usersDb.values()).find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Пользователь не найден' });
    }

    const DEFAULT_DEMO_BALANCE = 10000.00;
    user.balance = DEFAULT_DEMO_BALANCE;

    usersDb.set(user.email, user);

    res.json({
      status: 'success',
      message: 'Демо-баланс успешно пополнен до $10,000',
      newBalance: user.balance,
    });
  } catch (error) {
    console.error('[User Reset Demo Error]:', error);
    res.status(500).json({ status: 'error', message: 'Ошибка при сбросе баланса' });
  }
});

// ==========================================
// 4. ТОРГОВАЯ СТАТИСТИКА ПОЛЬЗОВАТЕЛЯ
// ==========================================
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const userTrades = tradeHistoryDb.filter(t => t.userId === userId);

    const totalTrades = userTrades.length;
    const winningTrades = userTrades.filter(t => t.status === 'WIN').length;
    const losingTrades = userTrades.filter(t => t.status === 'LOSS').length;

    const winRate = totalTrades > 0 ? parseFloat(((winningTrades / totalTrades) * 100).toFixed(1)) : 0;
    const totalVolume = userTrades.reduce((acc, t) => acc + (t.amount || 0), 0);
    const netProfit = userTrades.reduce((acc, t) => acc + (t.profit || 0) - (t.amount || 0), 0);

    res.json({
      status: 'success',
      stats: {
        totalTrades,
        winningTrades,
        losingTrades,
        winRate: `${winRate}%`,
        totalVolume: parseFloat(totalVolume.toFixed(2)),
        netProfit: parseFloat(netProfit.toFixed(2)),
      },
    });
  } catch (error) {
    console.error('[User Stats Error]:', error);
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

    const user = Array.from(usersDb.values()).find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Пользователь не найден' });
    }

    // Проверка текущего пароля
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ status: 'error', message: 'Текущий пароль указан неверно' });
    }

    // Хэширование и запись нового пароля
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    usersDb.set(user.email, user);

    res.json({
      status: 'success',
      message: 'Пароль успешно изменен',
    });
  } catch (error) {
    console.error('[User Change Password Error]:', error);
    res.status(500).json({ status: 'error', message: 'Ошибка при смене пароля' });
  }
});

module.exports = router;
