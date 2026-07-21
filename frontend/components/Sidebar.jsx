
import React, { useState } from 'react';
import {
  TrendingUp,
  History,
  BarChart2,
  Trophy,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';

export default function Sidebar({ activeTab = 'trade', setActiveTab }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Список основных разделов
  const menuItems = [
    { id: 'trade', label: 'Торговля', icon: TrendingUp },
    { id: 'assets', label: 'Активы', icon: Layers },
    { id: 'history', label: 'История сделок', icon: History },
    { id: 'analytics', label: 'Аналитика', icon: BarChart2 },
    { id: 'leaderboard', label: 'Топ трейдеров', icon: Trophy },
  ];

  // Дополнительные опции
  const bottomItems = [
    { id: 'settings', label: 'Настройки', icon: Settings },
    { id: 'support', label: 'Поддержка', icon: HelpCircle },
  ];

  const handleSelect = (id) => {
    if (setActiveTab) {
      setActiveTab(id);
    }
  };

  return (
    <aside style={{ ...styles.sidebar, width: isCollapsed ? '72px' : '230px' }}>
      {/* Кнопка сжатия / разворачивания сайдбара */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={styles.toggleButton}
        title={isCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Основная навигация */}
      <div style={styles.menuContainer}>
        <div style={styles.sectionTitle}>
          {!isCollapsed && <span>НАВИГАЦИЯ</span>}
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} color={isActive ? '#3B82F6' : '#94A3B8'} />
              {!isCollapsed && (
                <span style={{ ...styles.navLabel, color: isActive ? '#F8FAFC' : '#94A3B8' }}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Нижний блок (Настройки, Поддержка и Защита) */}
      <div style={styles.bottomContainer}>
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} color={isActive ? '#3B82F6' : '#94A3B8'} />
              {!isCollapsed && (
                <span style={{ ...styles.navLabel, color: isActive ? '#F8FAFC' : '#94A3B8' }}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}

        {/* Статус соединения */}
        {!isCollapsed && (
          <div style={styles.securityBadge}>
            <Shield size={14} color="#10B981" />
            <span>256-bit SSL Protection</span>
          </div>
        )}
      </div>
    </aside>
  );
}

// Стили компонента
const styles = {
  sidebar: {
    backgroundColor: '#1E293B',
    borderRight: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '16px 12px',
    transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    userSelect: 'none',
    boxSizing: 'border-box',
    zIndex: 5,
  },
  toggleButton: {
    position: 'absolute',
    top: '18px',
    right: '-13px',
    backgroundColor: '#334155',
    color: '#F8FAFC',
    border: '1px solid #475569',
    borderRadius: '50%',
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 20,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sectionTitle: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#64748B',
    padding: '0 12px 8px 12px',
    letterSpacing: '1px',
    minHeight: '16px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.15s ease',
  },
  navItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    boxShadow: 'inset 3px 0 0 #3B82F6',
  },
  navLabel: {
    fontSize: '14px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  bottomContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    borderTop: '1px solid #334155',
    paddingTop: '12px',
  },
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    backgroundColor: '#0F172A',
    padding: '8px',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#94A3B8',
    marginTop: '8px',
    border: '1px solid #334155',
  }
};
