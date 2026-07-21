
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      // Позволяет использовать удобный импорт через '@/' (например, '@/components/Header')
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000, // Порт для локального сервера разработки
    open: true, // Автоматически открывать браузер при запуске
    cors: true,
    // Проксирование запросов к бэкенду (Node.js серверу)
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Адрес вашего бэкенд-сервера
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://localhost:5000', // Настройка прокси для WebSockets (если используются)
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist', // Папка для итоговой сборки
    sourcemap: true, // Генерация sourcemaps для удобного дебага
  },
});
