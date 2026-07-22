/**
 * frontend/vite.config.js
 * Конфигурация сборщика Vite для фронтенда NovaTrade.
 * Настраивает алиасы, проксирование API/WebSocket на бэкенд и параметры сборки.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  // Базовый путь. Оставляем '/', если деплоим на корень домена. 
  // (Если нужен деплой в подпапку, например на GitHub Pages, верни '/NOVATRADE/')
  base: '/', 
  
  plugins: [
    react(),
  ],
  
  resolve: {
    alias: {
      // ИСПРАВЛЕНО: В Vite (ESM) __dirname не определен. 
      // Используем fileURLToPath для корректной работы алиаса '@/'
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 3000, // Порт для локального сервера разработки
    open: true, // Автоматически открывать браузер при запуске
    
    // cors: true, <-- УБРАНО: CORS настраивается на бэкенде (в backend/server.js)

    // Проксирование запросов к бэкенду (Node.js серверу)
    proxy: {
      // Проксирование REST API. 
      // Изменено с '/api' на '/v1', чтобы совпадать с роутами нашего бэкенда (/v1/auth/login и т.д.)
      '/v1': {
        target: 'http://localhost:5000', 
        changeOrigin: true,
        secure: false,
      },
      // Проксирование WebSocket соединений для live-котировок
      '/ws': {
        target: 'ws://localhost:5000', 
        ws: true,
      },
    },
  },

  build: {
    outDir: 'dist', // Папка для итоговой сборки
    
    // sourcemap: true, // Раскомментируй, если нужен дебаг продакшн-сборки 
    // (но это увеличит размер бандла и раскроет исходный код)
  },
});
