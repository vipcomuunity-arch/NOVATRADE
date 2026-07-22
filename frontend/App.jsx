/**
 * frontend/App.jsx
 * Корневой компонент приложения NovaTrade.
 * Отвечает за глобальный роутинг (React Router), защиту маршрутов (Auth Guard)
 * и общий макет (Layout) с Header и Sidebar.
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Импорт компонентов макета
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Импорт страниц (Pages)
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

// Импорт страниц авторизации
import Login from './components/Login';
import Register from './components/Register';

// ==========================================
// 1. КОМПОНЕНТ ЗАЩИТЫ МАРШРУТОВ (AUTH GUARD)
// ==========================================
const ProtectedRoute = () => {
  // Простая проверка наличия токена. 
  // В будущем здесь будет проверка через Zustand store или контекст.
  const token = localStorage.getItem('accessToken'); 
  
  if (!token) {
    // Если токена нет, редиректим на страницу входа
    return <Navigate to="/login" replace />;
  }

  // Если токен есть, рендерим вложенные маршруты (Dashboard, Settings и т.д.)
  return <Outlet />;
};

// ==========================================
// 2. ГЛОБАЛЬНЫЙ МАКЕТ (LAYOUT)
// ==========================================
const MainLayout = () => {
  return (
    <div className="app-layout">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className="app-main">
          {/* Сюда React Router будет подставлять компонент текущей страницы (Dashboard, Settings и т.д.) */}
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

// ==========================================
// 3. КОРНЕВОЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ
// ==========================================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные маршруты (Авторизация) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Защищенные маршруты (Требуют авторизации) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Главная страница - Торговый терминал */}
            <Route index element={<Dashboard />} />
            
            {/* Настройки и Профиль */}
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Обработка несуществующих маршрутов (404) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
