/**
 * backend/routes/assets.js
 * Маршруты для получения списка торговых активов, их текущих котировок,
 * категорий и процентов выплат (Payouts).
 * Работает с реальной базой данных PostgreSQL через Knex.js.
 */
const express = require('express');
const router = express.Router();
const knex = require('knex');

// Импортируем централизованный конфиг и мидлвар авторизации
const config = require('../config');
const { authenticateToken } = require('./auth');

// Инициализация Knex (в идеале вынести в backend/db.js для переиспользования пула)
const db = knex(config.db);

// ==========================================
// 1. ПОЛУЧЕНИЕ СПИСКА ВСЕХ АКТИВНЫХ АКТИВОВ
// ==========================================
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;

    // Базовый запрос: только активные активы, отсортированные по категории и имени
    let query = db('assets')
      .where({ is_active: true })
      .orderBy('category', 'asc')
      .orderBy('name', 'asc');

    // Опциональная фильтрация по категории (например, ?category=Crypto)
    if (category) {
      query = query.where({ category: category.trim() });
    }

    const assets = await query;

    res.json({
      status: 'success',
      count: assets.length,
      assets,
    });
  } catch (error) {
    console.error('[Get Assets Error]:', error.message);
    res.status(500).json({ status: 'error', message: 'Ошибка при получении списка активов' });
  }
});

// ==========================================
// 2. ПОЛУЧЕНИЕ ИНФОРМАЦИИ ПО КОНКРЕТНОМУ АКТИВУ
// ==========================================
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const assetId = req.params.id.toUpperCase();

    const asset = await db('assets')
      .where({ id: assetId })
      .first();

    if (!asset) {
      return res.status(404).json({ status: 'error', message: 'Торговый актив не найден' });
    }

    res.json({
      status: 'success',
      asset,
    });
  } catch (error) {
    console.error('[Get Asset By ID Error]:', error.message);
    res.status(500).json({ status: 'error', message: 'Ошибка при получении данных актива' });
  }
});

// ==========================================
// ЭКСПОРТ
// ==========================================
module.exports = router;
