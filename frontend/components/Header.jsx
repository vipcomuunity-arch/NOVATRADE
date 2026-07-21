
import React from 'react';
import {
  Activity,
  Wallet,
  User,
  Bell,
  PlusCircle,
  ChevronDown
} from 'lucide-react';

export default function Header({ 
  balance = 10000.00, 
  isDemo = true, 
  onDeposit 
}) {
  return (
    <header style={styles.header}>
      {/* Логотип и брендинг */}
      <div style={styles.brandContainer}>
        <div style={styles.logoBadge}>
          <Activity size={24} color="#3B82F6" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={styles.logoText}>Nova Trade</h1>
          <span style={styles.subText}>TRADING PLATFORM</span>
        </div>
      </div>

      {/* Правая секция: Баланс, Уведомления, Профиль */}
      <div style={styles.rightSection}>
        {/* Карточка баланса */}
        <div style={styles.balanceCard}>
          <Wallet size={18} color="#10B981" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={styles.accountType}>
              {isDemo ? 'Демо-счёт' : 'Реальный счёт'}
            </span>
            <span style={styles.balanceAmount}>
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Кнопка пополнения */}
        <button onClick={onDeposit} style={styles.depositButton}>
          <PlusCircle size={16} />
          <span>Пополнить</span>
        </button>

        {/* Уведомления */}
        <button style={styles.iconButton} title="Уведомления">
          <Bell size={18} />
          <span style={styles.notificationDot} />
        </button>

        {/* Профиль пользователя */}
        <div style={styles.profileMenu}>
          <div style={styles.avatar}>
            <User size={18} color="#F8FAFC" />
          </div>
          <span style={styles.userName}>Трейдер</span>
          <ChevronDown size={14} color="#94A3B8" />
        </div>
      </div>
    </header>
  );
}

// Стили компонента
const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: '#1E293B',
    borderBottom: '1px solid #334155',
    userSelect: 'none',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  logoBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: '8px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(59, 130, 246, 0.2)',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '800',
    margin: 0,
    background: 'linear-gradient(to right, #3B82F6, #60A5FA)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.5px',
  },
  subText: {
    fontSize: '9px',
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: '1px',
    marginTop: '-2px',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  balanceCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#0F172A',
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid #334155',
  },
  accountType: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  balanceAmount: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#10B981',
    lineHeight: '1.2',
  },
  depositButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  iconButton: {
    position: 'relative',
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    color: '#94A3B8',
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '6px',
    height: '6px',
    backgroundColor: '#3B82F6',
    borderRadius: '50%',
  },
  profileMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 8px',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#E2E8F0',
  }
};
