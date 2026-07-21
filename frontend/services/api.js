
/**
 * frontendServicesApi.js
 * Путь в проекте: frontend/services/api.js или src/services/api.js
 * 
 * Модуль взаимодействия с REST API для торговой платформы NovaTrade.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.novatrade.io/v1';

/**
 * Вспомогательная функция для выполнения HTTP-запросов к API
 */
async function request(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Если отправляем файлы/FormData, браузер должен сам автоматически выставить Content-Type с boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // Обработка автоматического разлогинивания при истечении токена
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Ошибка сервера (${response.status})`);
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
}

// ==========================================
// 1. АУТЕНТИФИКАЦИЯ И АВТОРИЗАЦИЯ (AUTH)
// ==========================================
export const authApi = {
  // Вход пользователя
  async login(credentials) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  },

  // Регистрация нового аккаунта
  async register(userData) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  },

  // Выход из системы
  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    }
  },

  // Проверка актуальности сессии / получение текущего пользователя
  async getMe() {
    return request('/auth/me');
  },
};

// ==========================================
// 2. ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ И KYC (PROFILE)
// ==========================================
export const profileApi = {
  // Получение данных профиля
  async getProfile() {
    return request('/user/profile');
  },

  // Обновление личной информации (ФИО, телефон, страна)
  async updateProfile(profileData) {
    return request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Смена пароля
  async changePassword({ currentPass, newPass }) {
    return request('/user/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPass, newPass }),
    });
  },

  // Включение или отключение 2FA
  async toggle2FA(enabled) {
    return request('/user/2fa', {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
  },

  // Загрузка фото/документа для верификации KYC
  async uploadKycDocument(file, docType) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('docType', docType);

    return request('/user/kyc/upload', {
      method: 'POST',
      body: formData,
    });
  },
};

// ==========================================
// 3. ТОРГОВЛЯ И ТОРГОВАЯ ПАНЕЛЬ (TRADING)
// ==========================================
export const tradingApi = {
  // Получение текущего баланса
  async getBalance() {
    return request('/trading/balance');
  },

  // Список доступных торговых активов и их доходности (% payout)
  async getAssets() {
    return request('/trading/assets');
  },

  // Открытие сделки (ВЫШЕ / НИЖЕ)
  async placeTrade(tradeParams) {
    // tradeParams: { assetId, type: 'UP' | 'DOWN', amount, duration, accountType }
    return request('/trading/trades', {
      method: 'POST',
      body: JSON.stringify(tradeParams),
    });
  },

  // Получить список активных открытых позиций
  async getActiveTrades() {
    return request('/trading/trades/active');
  },

  // История завершенных сделок
  async getTradeHistory(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/trading/trades/history?${query}`);
  },
};

// ==========================================
// 4. НАСТРОЙКИ ПЛАТФОРМЫ (SETTINGS)
// ==========================================
export const settingsApi = {
  // Загрузить пользовательские настройки
  async getSettings() {
    return request('/user/settings');
  },

  // Сохранить новые настройки
  async updateSettings(settingsData) {
    return request('/user/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  },
};

// ==========================================
// 5. ФИНАНСЫ И ТРАНЗАКЦИИ (WALLET)
// ==========================================
export const walletApi = {
  // История финансовых операций (депозиты, выводы)
  async getTransactions() {
    return request('/wallet/transactions');
  },

  // Создать заявку на пополнение
  async createDeposit(depositData) {
    return request('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify(depositData),
    });
  },

  // Создать заявку на вывод средств
  async createWithdrawal(withdrawData) {
    return request('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(withdrawData),
    });
  },
};

// Экспорт единого объекта сервисов по умолчанию
const api = {
  auth: authApi,
  profile: profileApi,
  trading: tradingApi,
  settings: settingsApi,
  wallet: walletApi,
};

export default api;
