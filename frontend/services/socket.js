
/**
 * frontend-service-socket.js
 * Путь в проекте: frontend/services/socket.js или src/services/socket.js
 * 
 * Сервис WebSocket-соединения для получения рыночных котировок в реальном времени,
 * обновления сделок и получения уведомления от бэкенда NovaTrade.
 */

import authService from './auth';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.novatrade.io/ws';

class SocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map(); // Хранилище подписок на события: event -> Set(callbacks)
    this.subscriptions = new Set(); // Активные каналы подписок (например, "ticker:EURUSD")
    this.isConnecting = false;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000; // Начальный интервал повтора (1 сек)
    this.pingInterval = null;
  }

  /**
   * Инициализация WebSocket-соединения
   */
  connect() {
    if (this.isConnected || this.isConnecting) return;

    this.isConnecting = true;
    const token = authService.getAccessToken();

    // Передаём токен авторизации в URL-параметрах
    const url = token ? `${WS_URL}?token=${encodeURIComponent(token)}` : WS_URL;

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

  /**
   * Обработчик успешного открытия соединения
   */
  handleOpen() {
    console.log('[SocketService] Соединение установлено');
    this.isConnected = true;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;

    this.startHeartbeat();
    this.resubscribeAll();
    this.emit('connection_change', { connected: true });
  }

  /**
   * Обработчик входящих сообщений
   */
  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      const { type, payload } = message;

      // Обработка понга от сервера на наш пинг
      if (type === 'pong') return;

      // Оповещаем всех подписчиков данного типа событий
      this.emit(type, payload);
    } catch (error) {
      console.error('[SocketService] Ошибка парсинга сообщения:', error);
    }
  }

  /**
   * Обработчик ошибок соединения
   */
  handleError(error) {
    console.error('[SocketService] Ошибка WebSocket:', error);
    this.emit('error', error);
  }

  /**
   * Обработчик закрытия соединения
   */
  handleClose(event) {
    console.warn(`[SocketService] Соединение закрыто (код: ${event.code})`);
    this.isConnected = false;
    this.isConnecting = false;
    this.stopHeartbeat();

    this.emit('connection_change', { connected: false });

    // Если закрытие не было преднамеренным, пробуем переподключиться
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  /**
   * Запуск регулярной проверки активности (Ping/Pong)
   */
  startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.isConnected) {
        this.send('ping', {});
      }
    }, 30000); // каждые 30 секунд
  }

  /**
   * Остановка проверки активности
   */
  stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Попытка переподключения с экспоненциальной задержкой
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[SocketService] Превышено максимальное число попыток переподключения');
      return;
    }

    this.reconnectAttempts++;
    const timeout = Math.min(this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts), 30000);

    console.log(`[SocketService] Повторное подключение через ${(timeout / 1000).toFixed(1)} сек...`);

    setTimeout(() => {
      this.connect();
    }, timeout);
  }

  /**
   * Отправка сообщения на сервер
   */
  send(type, payload = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('[SocketService] Нельзя отправить сообщение: нет активного соединения');
    }
  }

  /**
   * Подписаться на котировки валютной пары/актива
   * @param {string} symbol - например, "EURUSD", "BTCUSD"
   */
  subscribeToAsset(symbol) {
    const channel = `asset:${symbol}`;
    this.subscriptions.add(channel);

    if (this.isConnected) {
      this.send('subscribe', { channel });
    }
  }

  /**
   * Отписаться от котировок актива
   */
  unsubscribeFromAsset(symbol) {
    const channel = `asset:${symbol}`;
    this.subscriptions.delete(channel);

    if (this.isConnected) {
      this.send('unsubscribe', { channel });
    }
  }

  /**
   * Переподписка на все активные каналы после реконнекта
   */
  resubscribeAll() {
    this.subscriptions.forEach((channel) => {
      this.send('subscribe', { channel });
    });
  }

  /**
   * Подписка на локальные события WebSocket (Pub/Sub)
   * @param {string} event - название события (например, 'quote_update', 'trade_result')
   * @param {Function} callback - функция-обработчик
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Возвращаем функцию отписки для удобства использования в useEffect
    return () => this.off(event, callback);
  }

  /**
   * Отписка от локального события
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  /**
   * Вызов всех зарегистрированных обработчиков для события
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (err) {
          console.error(`[SocketService] Ошибка в обработчике события '${event}':`, err);
        }
      });
    }
  }

  /**
   * Полное отключение от WebSocket
   */
  disconnect() {
    this.stopHeartbeat();
    this.subscriptions.clear();

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
