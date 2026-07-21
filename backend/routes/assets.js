/**
 * backend/routes/assets.js
 * 
 * Маршруты для получения списка торговых активов, их текущих котировок,
 * категорий и процентов выплат (Payouts).
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const { db } = require('./trades'); // Импортируем общую базу активов из trades.js[cite: 1]

/**
 * GET / - Получить список всех доступных активов
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const assets = db.assets || [
      { id: 'EURUSD', name: 'EUR / USD', category: 'Forex', price: 1.08500, payout: 85 },
      { id: 'GBPUSD', name: 'GBP / USD', category: 'Forex', price: 1.26420, payout: 82 },
      { id: 'BTCUSD', name: 'Bitcoin', category: 'Crypto', price: 67450.00, payout: 90 },
      { id: 'ETHUSD', name: 'Ethereum', category: 'Crypto', price: 3520.50, payout: 88 },
    ];

    res.json({
      status: 'success',
      count: assets.length,
      assets,
    });
  } catch (error) {
    console.error('[Get Assets Error]:', error);
    res.status(500).json({ status: 'error', message: 'Ошибка при получении списка активов' });
  }
});

/**
 * GET /:id - Получить информацию по конкретному активу
 */
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const assetId = req.params.id.toUpperCase();
    const assets = db.assets || [];
    const asset = assets.find(a => a.id === assetId);

    if (!asset) {
      return res.status(404).json({ status: 'error', message: 'Торговый актив не найден' });
    }

    res.json({
      status: 'success',
      asset,
    });
  } catch (error) {
    console.error('[Get Asset By ID Error]:', error);
    res.status(500).json({ status: 'error', message: 'Ошибка при получении данных актива' });
  }
});

module.exports = router;
