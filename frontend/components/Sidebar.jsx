/**
 * frontend/components/Sidebar.jsx
 * Боковая панель навигации приложения NovaTrade.
 * Интегрирована с React Router для реальной навигации между страницами.
 * Поддерживает сворачивание/разворачивание с плавной CSS-анимацией.
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  History,
  BarChart2,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Основные разделы с реальными путями (routes)
  const menuItems = [
    { id: 'trade', path: '/', label: 'Торговля', icon: TrendingUp },
    { id: 'assets', path: '/profile', label: 'Активы', icon: Layers },
    { id: 'history', path: '/profile', label: 'История сделок', icon: History },
    { id: 'analytics', path: '/profile', label: 'Аналитика', icon: BarChart2 },
  ];

  // Нижние разделы
  const bottomItems = [
    { id: 'settings', path: '/settings', label: 'Настройки', icon: Settings },
    { id: 'support', path: '/support', label: 'Поддержка', icon: HelpCircle },
  ];

  // Проверка активного маршрута
  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Кнопка сворачивания/разворачивания */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
        aria-label="Toggle sidebar"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Основная навигация */}
      <div className="sidebar-menu">
        <div className="sidebar-section-title">
          {!isCollapsed && <span>НАВИГАЦИЯ</span>}
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`sidebar-nav-item ${active ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} color={active ? '#3B82F6' : '#94A3B8'} />
              {!isCollapsed && (
                <span className="sidebar-nav-label">{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Нижний блок (Настройки, Поддержка, Статус) */}
      <div className="sidebar-bottom">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`sidebar-nav-item ${active ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} color={active ? '#3B82F6' : '#94A3B8'} />
              {!isCollapsed && (
                <span className="sidebar-nav-label">{item.label}</span>
              )}
            </Link>
          );
        })}
        
        {!isCollapsed && (
          <div className="sidebar-security-badge">
            <Shield size={14} color="#10B981" />
            <span>256-bit SSL Protection</span>
          </div>
        )}
      </div>
    </aside>
  );
}
