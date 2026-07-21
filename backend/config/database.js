/**
 * backend-config.js
 * Путь в проекте: backend/src/config/index.js или backend/config.js
 * 
 * Главный модуль конфигурации бэкенда NovaTrade.
 * Объединяет переменные окружения, настройки БД, WebSocket, лимиты и торговые параметры.
 */

require('dotenv').config();

const config = {
  // ==========================================
  // 1. ОСНОВНЫЕ НАСТРОЙКИ СЕРВЕРА
  // ==========================================
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  isProduction: process.env.NODE_ENV === 'production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // ==========================================
  // 2. БЕЗОПАСНОСТЬ И ТОКЕНЫ (SECURITY)
  // ==========================================
  security: {
    jwtSecret: process.env.JWT_SECRET || 'novatrade_super_secret_key_2026_change_me_in_prod',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'novatrade_refresh_secret_key_2026',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'https://novatrade.io'],
  },

  // ==========================================
  // 3. БАЗА ДАННЫХ POSTGRESQL (KNEX / PG)
  // ==========================================
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'novatrade_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    poolMin: parseInt(process.env.DB_POOL_MIN, 10) || 2,
    poolMax: parseInt(process.env.DB_POOL_MAX, 10) || 10,
  },

  // ==========================================
  // 4. КЭШ И ОЧЕРЕДИ REDIS
  // ==========================================
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || null,
    ttlSec: parseInt(process.env.REDIS_TTL, 10) || 86400, // 24 часа по умолчанию
  },

  // ==========================================
  // 5. ТОРГОВЫЕ ПАРАМЕТРЫ И ЛИМИТЫ (TRADING)
  // ==========================================
  trading: {
    minBetAmount: 1.0,           // Минимальная сумма сделки ($1)
    maxBetAmount: 5000.0,        // Максимальная сумма сделки ($5000)
    defaultDemoBalance: 10000.0, // Стартовый баланс демо-счета ($10,000)
    
    // Допустимые таймфреймы экспирации в секундах (5 сек, 15 сек, 1 мин, 5 мин, 15 мин и т.д.)
    allowedDurationsSec: [5, 10, 15, 30, 60, 120, 300, 900, 1800, 3600],
    
    // Стандартные проценты выплат (% Payout)
    defaultPayouts: {
      forex: 85,    // Forex валютные пары
      crypto: 90,   // Криптовалюты
      stocks: 80,   // Акции компаний
      commodities: 78, // Сырьевые товары
    },
  },

  // ==========================================
  // 6. НАСТРОЙКИ WEBSOCKET И ГЕНЕРАТОРА ЦЕН
  // ==========================================
  websocket: {
    path: '/ws',
    pingIntervalMs: 30000, // Пинг каждые 30 сек
    quoteTickRateMs: 1000, // Частота обновления котировок (каждую секунду)
    volatilityFactor: 0.0008, // Коэффициент волатильности симулятора
  },

  // ==========================================
  // 7. RATE LIMITING (ОГРАНИЧЕНИЕ НАГРУЗКИ)
  // ==========================================
  rateLimit: {
    windowMs: 15 * 60 * 1000, // Окно 15 минут
    maxRequests: 300,          // Макс запросов на IP
  },
};

// Валидация важнейших ключей при запуске в продакшене
if (config.isProduction && config.security.jwtSecret.includes('change_me')) {
  console.warn('⚠️ [WARNING] ВНИМАНИЕ: Задайте безопасный JWT_SECRET в файле .env!');
}

module.exports = config;
