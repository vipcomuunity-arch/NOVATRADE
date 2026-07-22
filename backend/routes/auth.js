/**
 * backend/routes/auth.js
 * Маршруты аутентификации и авторизации пользователей NovaTrade.
 * Работает с реальной базой данных PostgreSQL через Knex.js.
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const knex = require('knex');

// Импортируем централизованный конфиг
const config = require('../config'); 

// ==========================================
// 1. ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ (KNEX)
// ==========================================
// Примечание: В идеале этот инстанс нужно вынести в отдельный файл backend/db.js, 
// чтобы переиспользовать один пул соединений во всем приложении.
const db = knex(config.db);

// ==========================================
// 2. ХРАНИЛИЩЕ REFRESH TOKENS (MVP)
// ==========================================
// TODO: В продакшене это нужно перенести в Redis (config.redis), 
// чтобы токены не пропадали при перезапуске сервера и работали в кластере.
const activeRefreshTokens = new Set();

// ==========================================
// 3. MIDDLEWARE АУТЕНТИФИКАЦИИ
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Токен авторизации отсутствует' });
  }

  jwt.verify(token, config.security.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: 'error', message: 'Недействительный или истекший токен' });
    }
    req.user = decoded; // { id, email }
    next();
  });
};

// ==========================================
// 4. РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ (REGISTER)
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 1. Валидация входных данных
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Укажите email и пароль' });
    }
    if (password.length < 6) {
      return res.status(400).json({ status: 'error', message: 'Пароль должен содержать минимум 6 символов' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Проверка существования пользователя в БД
    const existingUser = await db('users').where({ email: normalizedEmail }).first();
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'Пользователь с таким email уже существует' });
    }

    // 3. Хэширование пароля
    const passwordHash = await bcrypt.hash(password, config.security.bcryptSaltRounds);

    // 4. Создание пользователя в БД (ID генерируется самой БД через gen_random_uuid())
    const [newUser] = await db('users')
      .insert({
        email: normalizedEmail,
        password_hash: passwordHash,
        name: name || normalizedEmail.split('@')[0],
        balance: config.trading.defaultDemoBalance,
        currency: 'USD',
        is_verified: false,
      })
      .returning(['id', 'email', 'name', 'balance', 'currency']);

    // 5. Генерация JWT токенов
    const tokenPayload = { id: newUser.id, email: newUser.email };
    const accessToken = jwt.sign(tokenPayload, config.security.jwtSecret, { expiresIn: config.security.jwtExpiresIn });
    const refreshToken = jwt.sign(tokenPayload, config.security.refreshSecret, { expiresIn: config.security.refreshExpiresIn });

    activeRefreshTokens.add(refreshToken);

    // 6. Успешный ответ
    res.status(201).json({
      status: 'success',
      message: 'Регистрация прошла успешно',
      accessToken,
      refreshToken,
      user: newUser,
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error.message);
    res.status(500).json({ status: 'error', message: 'Внутренняя ошибка сервера при регистрации' });
  }
});

// ==========================================
// 5. ВХОД В СИСТЕМУ (LOGIN)
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Заполните email и пароль' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Поиск пользователя в БД
    const user = await db('users').where({ email: normalizedEmail }).first();
    if (!user) {
      // Намеренно не уточняем, что именно неверно (безопасность)
      return res.status(400).json({ status: 'error', message: 'Неверный email или пароль' });
    }

    // 2. Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ status: 'error', message: 'Неверный email или пароль' });
    }

    // 3. Генерация токенов
    const tokenPayload = { id: user.id, email: user.email };
    const accessToken = jwt.sign(tokenPayload, config.security.jwtSecret, { expiresIn: config.security.jwtExpiresIn });
    const refreshToken = jwt.sign(tokenPayload, config.security.refreshSecret, { expiresIn: config.security.refreshExpiresIn });

    activeRefreshTokens.add(refreshToken);

    // 4. Успешный ответ (не отдаем password_hash!)
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
    console.error('[Auth Login Error]:', error.message);
    res.status(500).json({ status: 'error', message: 'Внутренняя ошибка сервера при входе' });
  }
});

// ==========================================
// 6. ОБНОВЛЕНИЕ ACCESS TOKENA (REFRESH)
// ==========================================
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ status: 'error', message: 'Refresh token не предоставлен' });
  }

  // Проверка наличия токена в нашем хранилище
  if (!activeRefreshTokens.has(refreshToken)) {
    return res.status(403).json({ status: 'error', message: 'Недействительный refresh token' });
  }

  jwt.verify(refreshToken, config.security.refreshSecret, (err, decoded) => {
    if (err) {
      activeRefreshTokens.delete(refreshToken); // Удаляем истекший/битый токен
      return res.status(403).json({ status: 'error', message: 'Истек срок действия refresh token' });
    }

    // Выпускаем новый access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email }, 
      config.security.jwtSecret, 
      { expiresIn: config.security.jwtExpiresIn }
    );

    res.json({
      status: 'success',
      accessToken: newAccessToken,
    });
  });
});

// ==========================================
// 7. ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ (ME)
// ==========================================
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // req.user.id берется из расшифрованного JWT
    const user = await db('users').where({ id: req.user.id }).first();
    
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
        is_verified: user.is_verified,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('[Auth Me Error]:', error.message);
    res.status(500).json({ status: 'error', message: 'Ошибка получения профиля' });
  }
});

// ==========================================
// 8. ВЫХОД ИЗ СИСТЕМЫ (LOGOUT)
// ==========================================
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    activeRefreshTokens.delete(refreshToken);
  }
  
  res.json({ status: 'success', message: 'Вы успешно вышли из системы' });
});

// ==========================================
// ЭКСПОРТ
// ==========================================
module.exports = router;
module.exports.authenticateToken = authenticateToken; // Экспортируем мидлвар для использования в других роутах
