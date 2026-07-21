/**
 * database_schema.sql
 * 
 * Полная схема реляционной базы данных PostgreSQL для торговой платформы NovaTrade.
 * Включает таблицы пользователей, торговых активов и сделок (активных и истории).
 */

-- Создание расширения для uuid (если необходимо)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ (USERS)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar TEXT,
  balance DECIMAL(12, 2) DEFAULT 10000.00 NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Индекс для быстрого поиска пользователей по email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ==========================================
-- 2. ТАБЛИЦА ТОРГОВЫХ АКТИВОВ (ASSETS)
-- ==========================================
CREATE TABLE IF NOT EXISTS assets (
  id VARCHAR(32) PRIMARY KEY,     -- уникальный тикер актива (напр. 'EURUSD', 'BTCUSD')[cite: 1]
  name VARCHAR(100) NOT NULL,     -- отображаемое имя (напр. 'EUR / USD', 'Bitcoin')[cite: 1]
  category VARCHAR(50) NOT NULL,  -- категория рынка (напр. 'Forex', 'Crypto')[cite: 1]
  price DECIMAL(18, 5) NOT NULL,  -- последняя актуальная цена[cite: 1]
  payout INTEGER NOT NULL,        -- процент выплаты по опциону (напр. 85, 90)[cite: 1]
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==========================================
-- 3. ТАБЛИЦА СДЕЛОК (TRADES)
-- ==========================================
CREATE TABLE IF NOT EXISTS trades (
  id VARCHAR(64) PRIMARY KEY,     -- уникальный идентификатор сделки (напр. 'trd_...')[cite: 1]
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,[cite: 1]
  asset_id VARCHAR(32) NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,[cite: 1]
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('UP', 'DOWN')), -- направление сделки (ВЫШЕ / НИЖЕ)[cite: 1]
  entry_price DECIMAL(18, 5) NOT NULL, -- цена входа в сделку[cite: 1]
  exit_price DECIMAL(18, 5),      -- цена закрытия (фиксируется при экспирации)[cite: 1]
  amount DECIMAL(12, 2) NOT NULL, -- сумма инвестиции[cite: 1]
  payout INTEGER NOT NULL,        -- процент выплаты на момент открытия[cite: 1]
  status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE', 'WIN', 'LOSS', 'DRAW')),[cite: 1]
  profit DECIMAL(12, 2) DEFAULT 0.00 NOT NULL, -- итоговый профит / выплата[cite: 1]
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,[cite: 1]
  expire_at TIMESTAMPTZ NOT NULL, -- время экспирации (закрытия)[cite: 1]
  closed_at TIMESTAMPTZ           -- фактическое время завершения[cite: 1]
);

-- Индексы для оптимизации выборки сделок пользователя и аналитики
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at DESC);

-- ==========================================
-- 4. НАЧАЛЬНОЕ ЗАСЕИВАНИЕ ДАННЫХ (SEEDING)
-- ==========================================

-- Добавление стандартных торговых активов (Forex и Crypto)[cite: 1]
INSERT INTO assets (id, name, category, price, payout) VALUES
('EURUSD', 'EUR / USD', 'Forex', 1.08500, 85),[cite: 1]
('GBPUSD', 'GBP / USD', 'Forex', 1.26420, 82),[cite: 1]
('BTCUSD', 'Bitcoin', 'Crypto', 67450.00, 90),[cite: 1]
('ETHUSD', 'Ethereum', 'Crypto', 3520.50, 88)[cite: 1]
ON CONFLICT (id) DO UPDATE SET 
  price = EXCLUDED.price,
  payout = EXCLUDED.payout,
  updated_at = CURRENT_TIMESTAMP;
