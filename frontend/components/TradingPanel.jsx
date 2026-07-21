
import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Percent,
  AlertCircle,
  Zap,
  Plus
} from 'lucide-react';

export default function TradingPanel({
  selectedAsset = { name: 'BTC / USD', payout: 85, price: 64250.0 },
  currentPrice = 64250.0,
  balance = 10000.0,
  onTrade,
  activeTrades = []
}) {
  const [amount, setAmount] = useState(100);
  const [duration, setDuration] = useState('01:00');

  const payoutRate = selectedAsset?.payout || 80;
  const profit = (amount * (payoutRate / 100)).toFixed(2);
  const totalPayout = (Number(amount) + Number(profit)).toFixed(2);
  const isInsufficientBalance = amount > balance;

  // Быстрые изменения суммы
  const handleAmountChange = (value) => {
    const num = Math.max(0, Number(value));
    setAmount(num);
  };

  const addAmount = (delta) => {
    setAmount((prev) => Math.max(1, prev + delta));
  };

  const multiplyAmount = (factor) => {
    setAmount((prev) => Math.max(1, Math.round(prev * factor)));
  };

  const handleExecute = (type) => {
    if (isInsufficientBalance || amount <= 0) return;
    if (onTrade) {
      onTrade(type, amount, duration);
    }
  };

  return (
    <aside style={styles.panelContainer}>
      <div style={styles.header}>
        <Zap size={18} color="#3B82F6" />
        <h2 style={styles.title}>Панель торговли</h2>
      </div>

      {/* Поле ввода суммы */}
      <div style={styles.section}>
        <div style={styles.labelRow}>
          <label style={styles.label}>Сумма инвестиции ($)</label>
          <span style={styles.maxLabel} onClick={() => setAmount(Math.floor(balance))}>
            МАКС (${balance.toLocaleString()})
          </span>
        </div>

        <div style={styles.inputWrapper}>
          <DollarSign size={16} color="#64748B" style={styles.inputIcon} />
          <input
            type="number"
            value={amount === 0 ? '' : amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            style={{
              ...styles.input,
              borderColor: isInsufficientBalance ? '#EF4444' : '#334155'
            }}
            placeholder="100"
          />
        </div>

        {/* Быстрые кнопки управления суммой */}
        <div style={styles.quickButtonsGrid}>
          <button style={styles.quickBtn} onClick={() => addAmount(10)}>+$10</button>
          <button style={styles.quickBtn} onClick={() => addAmount(50)}>+$50</button>
          <button style={styles.quickBtn} onClick={() => addAmount(100)}>+$100</button>
          <button style={styles.quickBtn} onClick={() => multiplyAmount(0.5)}>½</button>
          <button style={styles.quickBtn} onClick={() => multiplyAmount(2)}>x2</button>
        </div>
      </div>

      {/* Поле выбора времени */}
      <div style={styles.section}>
        <label style={styles.label}>Время экспирации</label>
        <div style={styles.inputWrapper}>
          <Clock size={16} color="#64748B" style={styles.inputIcon} />
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            style={styles.select}
          >
            <option value="01:00">01:00 мин (Спринт)</option>
            <option value="02:00">02:00 мин</option>
            <option value="05:00">05:00 мин</option>
            <option value="15:00">15:00 мин</option>
            <option value="60:00">01:00 час</option>
          </select>
        </div>
      </div>

      {/* Информационная карточка доходности */}
      <div style={styles.payoutCard}>
        <div style={styles.payoutRow}>
          <span style={styles.payoutLabel}>Доходность:</span>
          <span style={styles.payoutBadge}>+{payoutRate}%</span>
        </div>
        <div style={styles.payoutRow}>
          <span style={styles.payoutLabel}>Чистая прибыль:</span>
          <span style={styles.profitValue}>+${profit}</span>
        </div>
        <div style={styles.payoutRowTotal}>
          <span>Итоговая выплата:</span>
          <span style={styles.totalValue}>${totalPayout}</span>
        </div>
      </div>

      {/* Ошибка недостатка баланса */}
      {isInsufficientBalance && (
        <div style={styles.errorAlert}>
          <AlertCircle size={14} color="#EF4444" />
          <span>Недостаточно средств на счёте</span>
        </div>
      )}

      {/* Кнопки открытия сделки */}
      <div style={styles.tradeButtonsContainer}>
        <button
          onClick={() => handleExecute('UP')}
          disabled={isInsufficientBalance || amount <= 0}
          style={{
            ...styles.actionBtn,
            ...styles.upBtn,
            opacity: isInsufficientBalance || amount <= 0 ? 0.5 : 1
          }}
        >
          <TrendingUp size={22} />
          <span>ВЫШЕ</span>
        </button>

        <button
          onClick={() => handleExecute('DOWN')}
          disabled={isInsufficientBalance || amount <= 0}
          style={{
            ...styles.actionBtn,
            ...styles.downBtn,
            opacity: isInsufficientBalance || amount <= 0 ? 0.5 : 1
          }}
        >
          <TrendingDown size={22} />
          <span>НИЖЕ</span>
        </button>
      </div>

      {/* Активные сделки */}
      <div style={styles.historySection}>
        <div style={styles.historyHeader}>
          <span>Открытые позиции ({activeTrades.length})</span>
        </div>
        <div style={styles.historyList}>
          {activeTrades.length === 0 ? (
            <div style={styles.emptyState}>Активных сделок нет</div>
          ) : (
            activeTrades.map((trade) => (
              <div key={trade.id || Math.random()} style={styles.tradeCard}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontWeight: '700',
                        color: trade.type === 'UP' ? '#10B981' : '#EF4444'
                      }}
                    >
                      {trade.type === 'UP' ? '▲ ВЫШЕ' : '▼ НИЖЕ'}
                    </span>
                    <span style={styles.tradeAmount}>${trade.amount}</span>
                  </div>
                  <div style={styles.tradeMeta}>
                    {trade.asset || selectedAsset.name} @ ${trade.entryPrice}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={styles.tradeProfit}>+${((trade.amount * payoutRate) / 100).toFixed(2)}</div>
                  <div style={styles.tradeTime}>{trade.time || 'Только что'}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

// Стили компонента
const styles = {
  panelContainer: {
    width: '320px',
    backgroundColor: '#1E293B',
    borderLeft: '1px solid #334155',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    boxSizing: 'border-box',
    userSelect: 'none',
    height: '100%',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#F8FAFC',
    margin: 0
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#94A3B8'
  },
  maxLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#3B82F6',
    cursor: 'pointer',
    letterSpacing: '0.5px'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none'
  },
  input: {
    width: '100%',
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 10px 10px 36px',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: '600',
    outline: 'none',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 10px 10px 36px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '500',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },
  quickButtonsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '6px',
    marginTop: '6px'
  },
  quickBtn: {
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#94A3B8',
    padding: '6px 0',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center'
  },
  payoutCard: {
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  payoutRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px'
  },
  payoutRowTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    fontWeight: '700',
    color: '#F8FAFC',
    borderTop: '1px solid #1E293B',
    paddingTop: '8px',
    marginTop: '2px'
  },
  payoutLabel: {
    color: '#64748B'
  },
  payoutBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: '#10B981',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '700',
    fontSize: '11px'
  },
  profitValue: {
    color: '#10B981',
    fontWeight: '700'
  },
  totalValue: {
    color: '#3B82F6',
    fontWeight: '700'
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '8px 12px',
    borderRadius: '6px',
    color: '#EF4444',
    fontSize: '12px',
    fontWeight: '500'
  },
  tradeButtonsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  actionBtn: {
    border: 'none',
    borderRadius: '10px',
    padding: '14px 8px',
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
  },
  upBtn: {
    backgroundColor: '#10B981',
  },
  downBtn: {
    backgroundColor: '#EF4444',
  },
  historySection: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  historyHeader: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  historyList: {
    maxHeight: '160px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  emptyState: {
    fontSize: '12px',
    color: '#64748B',
    textAlign: 'center',
    padding: '12px',
    backgroundColor: '#0F172A',
    borderRadius: '6px',
    border: '1px border #334155'
  },
  tradeCard: {
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    padding: '8px 12px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tradeAmount: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#F8FAFC'
  },
  tradeMeta: {
    fontSize: '10px',
    color: '#64748B',
    marginTop: '2px'
  },
  tradeProfit: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#10B981'
  },
  tradeTime: {
    fontSize: '10px',
    color: '#64748B',
    marginTop: '2px'
  }
};
