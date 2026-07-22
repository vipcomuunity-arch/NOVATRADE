/**
 * frontend/services/socket.js
 * Сервис WebSocket-соединения для получения рыночных котировок в реальном времени,
 * обновлений баланса и результатов сделок от бэкенда NovaTrade.
 * Реализует паттерн Singleton, автопереподключение и Heartbeat.
 */
import authService from './auth';

// ==========================================
// 1. ОПРЕДЕЛЕНИЕ URL WEBSOCKET
// ==========================================
const getWsUrl = () => {
  // Если задан явный URL в .env (например, для продакшена)
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  
  // В dev-режиме Vite proxy сам обработает путь /ws
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
};

// ==========================================
// 2. КЛАСС SOCKET SERVICE (SINGLETON)
// ==========================================
class SocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map(); // event -> Set(callbacks)
    this.isConnecting = false;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000; 
    this.pingInterval = null;
  }

  /**
   * Инициализация WebSocket-соединения
   */
  connect() {
    if (this.isConnected || this.isConnecting) return;
    this.isConnecting = true;

    const token = authService.getAccessToken();
    // Передаём токен в query-параметре (бэкенд может использовать это для идентификации)
    const url = token ? `${getWsUrl()}?token=${encodeURIComponent(token)}` : getWsUrl();

    try {
      this.ws = new WebSocket(url);
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error) {
      console.error('[SocketService] Ошибка создания WebSocket:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  handleOpen() {
    console.log('[SocketService] Соединение установлено');
    this.isConnected = true;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    this.startHeartbeat();
    this.emit('connection_change', { connected: true });
  }

  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      const { type, payload } = message;

      // Игнорируем служебные ответы на наш пинг
      if (type === 'pong') return;

      // Оповещаем всех подписчиков данного типа событий
      this.emit(type, payload);
    } catch (error) {
      console.error('[SocketService] Ошибка парсинга сообщения:', error);
    }
  }

  handleError(error) {
    console.error('[SocketService] Ошибка WebSocket:', error);
    this.emit('error', error);
  }

  handleClose(event) {
    console.warn(`[SocketService] Соединение закрыто (код: ${event.code})`);
    this.isConnected = false;
    this.isConnecting = false;
    this.stopHeartbeat();
    this.emit('connection_change', { connected: false });

    // Если закрытие не было преднамеренным (код 1000), пробуем переподключиться
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.isConnected) {
        this.send('ping', {});
      }
    }, 30000); // каждые 30 секунд
  }

  stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[SocketService] Превышено максимальное число попыток переподключения');
      return;
    }
    this.reconnectAttempts++;
    // Экспоненциальная задержка (1с, 1.5с, 2.25с... до макс 30с)
    const timeout = Math.min(this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts), 30000);
    console.log(`[SocketService] Повторное подключение через ${(timeout / 1000).toFixed(1)} сек...`);
    
    setTimeout(() => {
      this.connect();
    }, timeout);
  }

  send(type, payload = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  // ==========================================
  // СИСТЕМА ПОДПИСОК (PUB/SUB)
  // ==========================================
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    // Возвращаем функцию отписки для удобства использования в useEffect
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (err) {
          console.error(`[SocketService] Ошибка в обработчике '${event}':`, err);
        }
      });
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Преднамеренное закрытие');
      this.ws = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
  }
}

// Экспортируем единственный экземпляр класса (Singleton)
export const socketService = new SocketService();
export default socketService;
