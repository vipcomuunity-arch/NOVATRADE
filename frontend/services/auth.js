/**
 * frontend-services-auth.js
 * Путь в проекте: frontend/services/auth.js или src/services/auth.js
 * 
 * Сервис аутентификации, сессий и управления токенами доступа для NovaTrade.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.novatrade.io/v1';

// Ключи локального хранилища
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER_DATA: 'auth_user_data',
};

class AuthService {
  /**
   * Получить текущий Access Token из localStorage
   */
  getAccessToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Получить текущий Refresh Token
   */
  getRefreshToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Сохранить токены и данные пользователя в локальное хранилище
   */
  setSession(accessToken, refreshToken = null, user = null) {
    if (typeof window === 'undefined') return;

    if (accessToken) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    }
  }

  /**
   * Очистить сессию пользователя
   */
  clearSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  /**
   * Проверить, авторизован ли пользователь (наличие токена)
   */
  isAuthenticated() {
    return !!this.getAccessToken();
  }

  /**
   * Получить кэшированные данные пользователя
   */
  getStoredUser() {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    try {
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Авторизация пользователя (Логин)
   * @param {Object} credentials - { email, password }
   */
  async login(credentials) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка входа в систему');
      }

      // Если требуется подтверждение 2FA
      if (data.requires2FA) {
        return {
          requires2FA: true,
          tempToken: data.tempToken, // временный токен для 2FA шага
        };
      }

      // Сохраняем токен и пользователя
      this.setSession(data.accessToken, data.refreshToken, data.user);

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error('[AuthService] Login error:', error.message);
      throw error;
    }
  }

  /**
   * Подтверждение кода 2FA при входе
   * @param {string} code - 6-значный код из Google Authenticator
   * @param {string} tempToken - временный токен авторизации
   */
  async verify2FA(code, tempToken) {
    try {
      const response = await fetch(`${API_URL}/auth/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Неверный код 2FA');
      }

      this.setSession(data.accessToken, data.refreshToken, data.user);

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error('[AuthService] 2FA verification error:', error.message);
      throw error;
    }
  }

  /**
   * Регистрация нового аккаунта
   * @param {Object} userData - { name, email, password, promoCode }
   */
  async register(userData) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при регистрации');
      }

      this.setSession(data.accessToken, data.refreshToken, data.user);

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error('[AuthService] Registration error:', error.message);
      throw error;
    }
  }

  /**
   * Запрос на восстановление пароля (Отправка ссылки на Email)
   * @param {string} email
   */
  async requestPasswordReset(email) {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка отправки запроса');
      }

      return data;
    } catch (error) {
      console.error('[AuthService] Forgot password error:', error.message);
      throw error;
    }
  }

  /**
   * Установка нового пароля по токену из письма
   * @param {string} resetToken
   * @param {string} newPassword
   */
  async confirmPasswordReset(resetToken, newPassword) {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Сбой сброса пароля');
      }

      return data;
    } catch (error) {
      console.error('[AuthService] Reset password error:', error.message);
      throw error;
    }
  }

  /**
   * Обновление пары токенов с помощью Refresh Token
   */
  async refreshTokens() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearSession();
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.clearSession();
        throw new Error('Сессия истекла, войдите повторно');
      }

      this.setSession(data.accessToken, data.refreshToken, data.user);
      return data.accessToken;
    } catch (error) {
      this.clearSession();
      console.error('[AuthService] Refresh token error:', error.message);
      return null;
    }
  }

  /**
   * Выход из системы
   */
  async logout() {
    const token = this.getAccessToken();
    try {
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.warn('[AuthService] Logout request warning:', error.message);
    } finally {
      this.clearSession();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }
}

// Экспортируем единственный экземпляр класса (Singleton)
export const authService = new AuthService();
export default authService;
