/**
 * database/schema.sql
 * Полная схема реляционной базы данных PostgreSQL для торговой платформы NovaTrade.
 * Включает таблицы пользователей, торговых активов и сделок (активных и истории).
 */

-- ==========================================
-- 1. ТИПЫ ДАННЫХ (ENUM)
-- ==========================================
DO $$
BEGIN
    -- Направление сделки
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trade_direction') THEN
        CREATE TYPE trade_direction AS ENUM ('UP', 'DOWN');
    END IF;
    
    -- Статус сделки
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trade_status') THEN
        CREATE TYPE trade_status AS ENUM ('ACTIVE', 'WIN', 'LOSS', 'DRAW');
    END IF;
END$$;

-- ==========================================
-- 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
-- ==========================================
-- Функция для автоматического обновления поля updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================
-- 3. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ (USERS)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Нативный UUID (требует Postgres 13+)
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar TEXT,
    balance DECIMAL(15, 2) DEFAULT 10000.00 NOT NULL CHECK (balance >= 0),
    currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Триггер для автоматического updated_at
DROP TRIGGER IF EXISTS set_updated_at_on_users ON users;
CREATE TRIGGER set_updated_at_on_users
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 4. ТАБЛИЦА ТОРГОВЫХ АКТИВОВ (ASSETS)
-- ==========================================
CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR(20) PRIMARY KEY,     -- Уникальный тикер (напр. 'EURUSD', 'BTCUSD')
    name VARCHAR(100) NOT NULL,     -- Отображаемое имя (напр. 'EUR / USD')
    category VARCHAR(50) NOT NULL,  -- Категория рынка (напр. 'Forex', 'Crypto')
    price DECIMAL(18, 5) NOT NULL CHECK (price >= 0),
    payout INTEGER NOT NULL CHECK (payout > 0 AND payout <= 200), -- Процент выплаты
    is_active BOOLEAN DEFAULT TRUE NOT NULL, -- Флаг активности (для отключения во время выходных и т.д.)
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Триггер для автоматического updated_at
DROP TRIGGER IF EXISTS set_updated_at_on_assets ON assets;
CREATE TRIGGER set_updated_at_on_assets
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 5. ТАБЛИЦА СДЕЛОК (TRADES)
-- ==========================================
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_id VARCHAR(20) NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
    direction trade_direction NOT NULL,
    entry_price DECIMAL(18, 5) NOT NULL CHECK (entry_price >= 0),
    exit_price DECIMAL(18, 5) CHECK (exit_price >= 0),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0), -- Сумма инвестиции
    payout INTEGER NOT NULL,        -- Процент выплаты на момент открытия
    status trade_status DEFAULT 'ACTIVE' NOT NULL,
    profit DECIMAL(15, 2) DEFAULT 0.00 NOT NULL, -- Итоговый профит (может быть отрицательным при LOSS)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expire_at TIMESTAMPTZ NOT NULL, -- Время экспирации
    closed_at TIMESTAMPTZ           -- Фактическое время завершения
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_status ON trades(user_id, status); -- Быстрый поиск активных сделок юзера
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at DESC);

-- КРИТИЧЕСКИ ВАЖНЫЙ ИНДЕКС: для фоновых задач (cron), которые ипросроченные активные сделки
CREATE INDEX IF NOT EXISTS idx_trades_expire_active ON trades(expire_at) WHERE status = 'ACTIVE';

-- Триггер для updated_at (хотя сделки редко обновляются, кроме как при закрытии)
DROP TRIGGER IF EXISTS set_updated_at_on_trades ON trades;
CREATE TRIGGER set_updated_at_on_trades
    BEFORE UPDATE ON trades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 6. НАЧАЛЬНОЕ ЗАСЕИВАНИЕ ДАННЫХ (SEEDING)
-- ==========================================
-- Добавление стандартных торговых активов (Forex и Crypto)
INSERT INTO assets (id, name, category, price, payout) VALUES
('EURUSD', 'EUR / USD', 'Forex', 1.08500, 85),
('GBPUSD', 'GBP / USD', 'Forex', 1.26420, 82),
('BTCUSD', 'Bitcoin', 'Crypto', 67450.00, 90),
('ETHUSD', 'Ethereum', 'Crypto', 3520.50, 88)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    payout = EXCLUDED.payout,
    updated_at = CURRENT_TIMESTAMP;
