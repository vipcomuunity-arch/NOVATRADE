/**
 * frontend/components/Header.jsx
 * Верхняя панель приложения NovaTrade.
 * Отображает бренд, текущий баланс, кнопки действий и профиль пользователя.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Wallet, User, Bell, PlusCircle } from 'lucide-react';

export default function Header({ 
  balance = 10000.00, 
  isDemo = true, 
  onDeposit,
  userName = 'Трейдер',
  avatarUrl = null 
}) {
  // Форматирование баланса с разделителями тысяч и 2 знаками после запятой
  const formattedBalance = balance.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

  return (
    <header className="app-header">
      {/* Левая секция: Логотип и брендинг */}
      <Link to="/" className="header-brand">
        <div className="logo-badge">
          <Activity size={24} color="#3B82F6" />
        </div>
        <div className="brand-text-container">
          <h1 className="logo-text">Nova Trade</h1>
          <span className="sub-text">TRADING PLATFORM</span>
        </div>
      </Link>

      {/* Правая секция: Баланс, Действия, Профиль */}
      <div className="header-right">
        {/* Карточка баланса */}
        <div className="balance-card">
          <Wallet size={18} color="#10B981" />
          <div className="balance-info">
            <span className="account-type">
              {isDemo ? 'Демо-счёт' : 'Реальный счёт'}
            </span>
            <span className="balance-amount">${formattedBalance}</span>
          </div>
        </div>

        {/* Кнопка пополнения (показывается, если передан обработчик) */}
        {onDeposit && (
          <button onClick={onDeposit} className="deposit-btn" aria-label="Пополнить счет">
            <PlusCircle size={16} />
            <span>Пополнить</span>
          </button>
        )}

        {/* Уведомления */}
        <button className="icon-btn" aria-label="Уведомления">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>

        {/* Профиль пользователя (ссылка на страницу профиля) */}
        <Link to="/profile" className="header-profile">
          <div className="avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="avatar-img" />
            ) : (
              <User size={18} color="#F8FAFC" />
            )}
          </div>
          <span className="user-name">{userName}</span>
        </Link>
      </div>
    </header>
  );
}
