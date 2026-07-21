/**
 * backend/routes/auth.js
 * 
 * Маршруты аутентификации и авторизации пользователей NovaTrade.
 * Обрабатывает регистрацию, вход, обновление JWT токенов и получение профиля.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Загрузка конфигурации (или переменных окружения)
const JWT_SECRET = process.env.JWT_SECRET || 'novatrade_super_secret_key_2026_change_me_in_prod';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'novatrade_refresh_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// ==========================================
// ИМИТАЦИЯ БАЗЫ ДАННЫХ И ХРАНИЛИЩА ТОКЕНОВ
// ==========================================
const usersDb = new Map(); // email -> user object
const refreshTokensDb = new Set(); // active refresh tokens

// Инициализация тестового демо-аккаунта
(async () => {
  const demoPasswordHash = await bcrypt.hash('demo123456', 10);
  const demoUser = {
    id: 'usr_demo_777',
    email: 'demo@novatrade.io',
    passwordHash: demoPasswordHash,
    name: 'Demo Trader',
    balance: 10000.00,
    currency: 'USD',
    createdAt: new Date().toISOString(),
  };
  usersDb.set(demoUser.email, demoUser);
})();

// ==========================================
// MIDDLEWARE АУТЕНТИФИКАЦИИ
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Токен авторизации отсутствует' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ status: 'error', message: 'Недействительный или истекший токен' });
    }
    req.user = decoded;
    next();
  });
};

// ==========================================
// 1. РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ (REGISTER)
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Проверка обязательных полей
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Укажите email и пароль' });
    }

    if (password.length < 6) {
      return res.status(400).json({ status: 'error', message: 'Пароль должен содержать минимум 6 символов' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Проверка существования пользователя
    if (usersDb.has(normalizedEmail)) {
      return res.status(400).json({ status: 'error', message: 'Пользователь с таким email уже существует' });
    }

    // Хэширование пароля
    const passwordHash = await bcrypt.hash(password, 10);

    // Создание пользователя с демо-балансом $10,000
    const newUser = {
      id: 'usr_' + uuidv4().substring(0, 8),
      email: normalizedEmail,
      passwordHash,
      name: name || normalizedEmail.split('@')[0],
      balance: 10000.00,
      currency: 'USD',
      createdAt: new Date().toISOString(),
    };

    usersDb.set(normalizedEmail, newUser);

    // Генерация JWT токенов
    const accessToken = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

    refreshTokensDb.add(refreshToken);

    res.status(201).json({
      status: 'success',
      message: 'Регистрация прошла успешно',
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        balance: newUser.balance,
        currency: newUser.currency,
      },
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    res.status(500).json({ status: 'error', message: 'Внутренняя ошибка сервера' });
  }
});

// ==========================================
// 2. ВХОД В СИСТЕМУ (LOGIN)
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Заполните email и пароль' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = usersDb.get(normalizedEmail);

    if (!user) {
      return res.status(400).json({ status: 'error', message: 'Неверный email или пароль' });
    }

    // Сравнение хэша пароля
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ status: 'error', message: 'Неверный email или пароль' });
    }

    // Генерация токенов
    const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user.id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

    refreshTokensDb.add(refreshToken);

    res.json({
      status: 'success',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        balance: user.balance,
        currency: user.currency,
      },
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    res.status(500).json({ status: 'error', message: 'Внутренняя ошибка сервера' });
  }
});

// ==========================================
// 3. ОБНОВЛЕНИЕ ТОКЕНА (REFRESH TOKEN)
// ==========================================
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ status: 'error', message: 'Refresh token не предоставлен' });
  }

  if (!refreshTokensDb.has(refreshToken)) {
    return res.status(403).json({ status: 'error', message: 'Недействительный refresh token' });
  }

  jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) {
      refreshTokensDb.delete(refreshToken);
      return res.status(403).json({ status: 'error', message: 'Истек срок действия refresh token' });
    }

    const newAccessToken = jwt.sign({ id: decoded.id, email: decoded.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      status: 'success',
      accessToken: newAccessToken,
    });
  });
});

// ==========================================
// 4. ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ (ME)
// ==========================================
router.get('/me', authenticateToken, (req, res) => {
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
      balance: user.balance,
      currency: user.currency,
    },
  });
});

// ==========================================
// 5. ВЫХОД ИЗ СИСТЕМЫ (LOGOUT)
// ==========================================
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    refreshTokensDb.delete(refreshToken);
  }
  res.json({ status: 'success', message: 'Вы успешно вышли из системы' });
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.usersDb = usersDb;
