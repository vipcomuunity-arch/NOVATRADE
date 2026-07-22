/**
 * backend/config/index.js 
 * (В дереве файлов может называться database.js, но по факту это глобальный конфиг)
 * 
 * Главный модуль конфигурации бэкенда NovaTrade.
 * Объединяет переменные окружения, настройки БД, WebSocket, лимиты и торговые параметры.
 */
require('dotenv').config();

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ПАРСИНГА
// ==========================================
const parseIntSafe = (val, defaultVal) => {
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? defaultVal : parsed;
};

const parseBool = (val, defaultVal = false) => {
  if (val === undefined || val === null) return defaultVal;
  return val === 'true' || val === '1';
};

// ==========================================
// ОСНОВНОЙ ОБЪЕКТ КОНФИГУРАЦИИ
// ==========================================
const config = {
  // 1. ОСНОВНЫЕ НАСТРОЙКИ СЕРВЕРА
  env: process.env.NODE_ENV || 'development',
  port: parseIntSafe(process.env.PORT, 5000),
  isProduction: process.env.NODE_ENV === 'production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // 2. БЕЗОПАСНОСТЬ И ТОКЕНЫ (SECURITY)
  security: {
    jwtSecret: process.env.JWT_SECRET || 'novatrade_super_secret_key_2026_change_me_in_prod',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'novatrade_refresh_secret_key_2026',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    bcryptSaltRounds: parseIntSafe(process.env.BCRYPT_SALT_ROUNDS, 10),
    corsOrigins: process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) 
      : ['http://localhost:3000', 'http://localhost:5173'], // 5173 - стандартный порт Vite
  },

  // 3. БАЗА ДАННЫХ POSTGRESQL (KNEX / PG)
  db: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseIntSafe(process.env.DB_PORT, 5432),
      database: process.env.DB_NAME || 'novatrade_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    },
    pool: {
      min: parseIntSafe(process.env.DB_POOL_MIN, 2),
      max: parseIntSafe(process.env.DB_POOL_MAX, 10),
      // Таймауты для предотвращения утечек и зависаний соединений
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
      propagateCreateError: false,
    },
  },

  // 4. КЭШ И ОЧЕРЕДИ REDIS
  redis: {
    // Поддержка как прямого URL (для облаков), так и раздельных хост/порт
    url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${parseIntSafe(process.env.REDIS_PORT, 6379)}`,
    password: process.env.REDIS_PASSWORD || undefined,
    ttlSec: parseIntSafe(process.env.REDIS_TTL, 86400), // 24 часа по умолчанию
  },

  // 5. ТОРГОВЫЕ ПАРАМЕТРЫ И ЛИМИТЫ (TRADING)
  trading: {
    minBetAmount: 1.0,           // Минимальная сумма сделки ($)
    maxBetAmount: 5000.0,        // Максимальная сумма сделки ($)
    defaultDemoBalance: 10000.0, // Стартовый баланс демо-счета ($)
    // Допустимые таймфреймы экспирации в секундах
    allowedDurationsSec: [5, 10, 15, 30, 60, 120, 300, 900, 1800, 3600],
    // Стандартные проценты выплат (% Payout)
    defaultPayouts: {
      forex: 85,
      crypto: 90,
      stocks: 80,
      commodities: 78,
    },
  },

  // 6. НАСТРОЙКИ WEBSOCKET И ГЕНЕРАТОРА ЦЕН
  websocket: {
    path: '/ws',
    pingIntervalMs: 30000,       // Пинг каждые 30 сек
    quoteTickRateMs: 1000,       // Частота обновления котировок
    volatilityFactor: 0.0008,    // Коэффициент волатильности симулятора
  },

  // 7. RATE LIMITING (ОГРАНИЧЕНИЕ НАГРУЗКИ)
  rateLimit: {
    windowMs: 15 * 60 * 1000,    // Окно 15 минут
    maxRequests: 300,            // Макс запросов на IP
  },
};

// ==========================================
// ВАЛИДАЦИЯ ПРИ ЗАПУСКЕ
// ==========================================
if (config.isProduction) {
  const requiredEnvVars = ['JWT_SECRET', 'DB_PASSWORD'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(`❌ [FATAL ERROR] В production-режиме отсутствуют обязательные переменные окружения: ${missingVars.join(', ')}`);
    process.exit(1); // Падаем, чтобы не запускать сервер с небезопасными настройками
  }

  if (config.security.jwtSecret.includes('change_me')) {
    console.error('❌ [FATAL ERROR] JWT_SECRET содержит дефолтное значение. Задайте безопасный ключ в .env!');
    process.exit(1);
  }
}

module.exports = config;
