/**
 * frontend/services/api.js
 * Централизованный модуль взаимодействия с REST API NovaTrade.
 * Использует Axios с интерцепторами для автоматической авторизации
 * и обновления токенов при истечении срока действия.
 */
import axios from 'axios';

// ==========================================
// 1. СОЗДАНИЕ ЭКЗЕМПЛЯРА AXIOS
// ==========================================
// В dev-режиме Vite proxy перенаправит /v1/* на http://localhost:5000/v1/*
// В продакшене можно задать VITE_API_URL=https://api.novatrade.io
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// 2. INTERCEPTOR: АВТОМАТИЧЕСКОЕ ПРИКРЕПЛЕНИЕ ТОКЕНА
// ==========================================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// 3. INTERCEPTOR: АВТООБНОВЛЕНИЕ ТОКЕНА ПРИ 401
// ==========================================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если 401 и мы ещё не пробовали обновить токен
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Если обновление уже идёт, ставим запрос в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // Нет refresh token — разлогиниваем
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post('/v1/auth/refresh', { refreshToken });
        const newAccessToken = data.accessToken;

        localStorage.setItem('accessToken', newAccessToken);
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ==========================================
// 4. АУТЕНТИФИКАЦИЯ И АВТОРИЗАЦИЯ (AUTH)
// ==========================================
export const authApi = {
  async login(credentials) {
    const { data } = await apiClient.post('/auth/login', credentials);
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    return data;
  },

  async register(userData) {
    const { data } = await apiClient.post('/auth/register', userData);
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    return data;
  },

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await apiClient.post('/auth/logout', { refreshToken });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  async getMe() {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  async refreshToken(refreshToken) {
    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    return data;
  },
};

// ==========================================
// 5. ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ (USERS)
// ==========================================
export const profileApi = {
  async getProfile() {
    const { data } = await apiClient.get('/users/profile');
    return data;
  },

  async updateProfile(profileData) {
    const { data } = await apiClient.put('/users/profile', profileData);
    return data;
  },

  async changePassword({ currentPassword, newPassword }) {
    const { data } = await apiClient.put('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  },

  async resetDemoBalance() {
    const { data } = await apiClient.post('/users/reset-demo');
    return data;
  },

  async getStats() {
    const { data } = await apiClient.get('/users/stats');
    return data;
  },
};

// ==========================================
// 6. ТОРГОВЛЯ (TRADING)
// ==========================================
export const tradingApi = {
  async getAssets(params = {}) {
    const { data } = await apiClient.get('/trading/assets', { params });
    return data;
  },

  async getAssetById(assetId) {
    const { data } = await apiClient.get(`/trading/assets/${assetId}`);
    return data;
  },

  async placeTrade(tradeParams) {
    // tradeParams: { assetId, direction: 'UP'|'DOWN', amount, durationSec }
    const { data } = await apiClient.post('/trading/trades', tradeParams);
    return data;
  },

  async getActiveTrades() {
    const { data } = await apiClient.get('/trading/trades/active');
    return data;
  },

  async getTradeHistory(params = {}) {
    const { data } = await apiClient.get('/trading/trades/history', { params });
    return data;
  },
};

// ==========================================
// 7. ЭКСПОРТ ЕДИНОГО ОБЪЕКТА
// ==========================================
const api = {
  auth: authApi,
  profile: profileApi,
  trading: tradingApi,
  client: apiClient, // Прямой доступ к axios для кастомных запросов
};

export default api;
