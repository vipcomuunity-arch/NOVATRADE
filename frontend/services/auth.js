/**
 * frontend/services/auth.js
 * Сервис для управления токенами авторизации и состоянием сессии.
 * Работает с localStorage, синхронизирован с api.js и socket.js.
 */

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const authService = {
  /**
   * Получить Access Token
   */
  getAccessToken: () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Получить Refresh Token
   */
  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Сохранить токены после успешного логина/регистрации
   */
  setTokens: (accessToken, refreshToken) => {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  /**
   * Очистить токены (при выходе или истечении сессии)
   */
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Проверка, авторизован ли пользователь (есть ли access token)
   */
  isAuthenticated: () => {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Базовое декодирование JWT (без проверки подписи, только для чтения payload в UI)
   * Полезно, чтобы показать имя/аватар в Header без лишнего запроса к /auth/me
   */
  getUserPayloadFromToken: () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return null;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('[Auth Service] Ошибка декодирования токена:', error);
      return null;
    }
  }
};

export default authService;
