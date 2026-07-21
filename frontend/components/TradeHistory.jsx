
import React, { useState } from 'react';
import {
  History,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Демонстрационная история сделок по умолчанию
const DEFAULT_TRADES = [
  {
    id: 'tr-101',
    asset: 'BTC / USD',
    type: 'UP',
    amount: 100,
    entryPrice: 64100.00,
    closePrice: 64250.00,
    profit: 85.00,
    status: 'WIN',
    time: '14:25:10',
    date: '2026-07-21',
  },
  {
    id: 'tr-102',
    asset: 'ETH / USD',
    type: 'DOWN',
    amount: 200,
    entryPrice: 3480.00,
    closePrice: 3495.00,
    profit: -200.00,
    status: 'LOSS',
    time: '14:18:45',
    date: '2026-07-21',
  },
  {
    id: 'tr-103',
    asset: 'EUR / USD',
    type: 'UP',
    amount: 50,
    entryPrice: 1.0845,
    closePrice: 1.0852,
    profit: 40.00,
    status: 'WIN',
    time: '13:50:00',
    date: '2026-07-21',
  },
  {
    id: 'tr-104',
    asset: 'SOL / USD',
    type: 'DOWN',
    amount: 150,
    entryPrice: 146.20,
    closePrice: 145.50,
    profit: 120.00,
    status: 'WIN',
    time: '12:30:15',
    date: '2026-07-21',
  },
  {
    id: 'tr-105',
    asset: 'Apple Inc.',
    type: 'UP',
    amount: 300,
    entryPrice: 215.10,
    closePrice: 214.20,
    profit: -300.00,
    status: 'LOSS',
    time: '11:05:40',
    date: '2026-07-21',
  },
];

export default function TradingHistory({ trades = DEFAULT_TRADES }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'WIN' | 'LOSS'

  // Расчёт метрик и статистики
  const closedTrades = trades.filter((t) => t.status !== 'OPEN');
  const winTrades = trades.filter((t) => t.status === 'WIN');
  const lossTrades = trades.filter((t) => t.status === 'LOSS');
  const openTrades = trades.filter((t) => t.status === 'OPEN');

  const totalPnL = trades.reduce((acc, item) => acc + (item.profit || 0), 0);
  const winRate = closedTrades.length > 0
    ? ((winTrades.length / closedTrades.length) * 100).toFixed(1)
    : '0.0';

  // Отфильтрованный список
  const filteredTrades = trades.filter((trade) => {
    if (filter === 'OPEN') return trade.status === 'OPEN';
    if (filter === 'WIN') return trade.status === 'WIN';
    if (filter === 'LOSS') return trade.status === 'LOSS';
    return true;
  });

  return (
    <div style={styles.container}>
      {/* Шапка истории */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <History size={22} color="#3B82F6" />
          <h2 style={styles.title}>История сделок</h2>
        </div>
      </div>

      {/* Карточки со сводной статистикой */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Всего ордеров</div>
          <div style={styles.statValue}>{trades.length}</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Винрейт</div>
          <div style={{ ...styles.statValue, color: Number(winRate) >= 50 ? '#10B981' : '#EF4444' }}>
            {winRate}%
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Общий PnL</div>
          <div style={{ ...styles.statValue, color: totalPnL >= 0 ? '#10B981' : '#EF4444' }}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Фильтры вкладок */}
      <div style={styles.filterBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={14} color="#64748B" />
          <span style={styles.filterTitle}>Фильтр:</span>
        </div>
        <div style={styles.filterTabs}>
          {[
            { id: 'ALL', label: `Все (${trades.length})` },
            { id: 'OPEN', label: `Активные (${openTrades.length})` },
            { id: 'WIN', label: `Прибыльные (${winTrades.length})` },
            { id: 'LOSS', label: `Убыточные (${lossTrades.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                ...styles.filterBtn,
                ...(filter === tab.id ? styles.filterBtnActive : {}),
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Таблица сделок */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Актив / Направление</th>
              <th style={styles.th}>Инвестиция</th>
              <th style={styles.th}>Вход</th>
              <th style={styles.th}>Закрытие</th>
              <th style={styles.th}>Результат</th>
              <th style={styles.th}>Время</th>
              <th style={styles.th}>Статус</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={7} style={styles.emptyTd}>
                  Сделок с выбранным фильтром не найдено
                </td>
              </tr>
            ) : (
              filteredTrades.map((trade) => {
                const isUp = trade.type === 'UP';
                const isWin = trade.status === 'WIN';
                const isOpen = trade.status === 'OPEN';

                return (
                  <tr key={trade.id} style={styles.tr}>
                    {/* Актив и тип */}
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            ...styles.directionBadge,
                            backgroundColor: isUp ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: isUp ? '#10B981' : '#EF4444',
                          }}
                        >
                          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        </div>
                        <div>
                          <div style={styles.assetName}>{trade.asset}</div>
                          <div style={{ fontSize: '11px', color: isUp ? '#10B981' : '#EF4444', fontWeight: '600' }}>
                            {isUp ? 'ВЫШЕ' : 'НИЖЕ'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Сумма */}
                    <td style={styles.td}>
                      <span style={{ fontWeight: '600', color: '#F8FAFC' }}>
                        ${trade.amount}
                      </span>
                    </td>

                    {/* Цена входа */}
                    <td style={styles.td}>
                      <span style={{ color: '#94A3B8' }}>
                        ${trade.entryPrice.toLocaleString()}
                      </span>
                    </td>

                    {/* Цена закрытия */}
                    <td style={styles.td}>
                      <span style={{ color: '#94A3B8' }}>
                        {isOpen ? '—' : `$${trade.closePrice.toLocaleString()}`}
                      </span>
                    </td>

                    {/* Доход/Убыток */}
                    <td style={styles.td}>
                      {isOpen ? (
                        <span style={{ color: '#64748B' }}>В процессе...</span>
                      ) : (
                        <span
                          style={{
                            fontWeight: '700',
                            color: trade.profit >= 0 ? '#10B981' : '#EF4444',
                          }}
                        >
                          {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* Время */}
                    <td style={styles.td}>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>{trade.time}</div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>{trade.date}</div>
                    </td>

                    {/* Статус */}
                    <td style={styles.td}>
                      {isOpen && (
                        <div style={{ ...styles.statusBadge, backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' }}>
                          <Clock size={12} />
                          <span>Открыт</span>
                        </div>
                      )}
                      {isWin && (
                        <div style={{ ...styles.statusBadge, backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
                          <CheckCircle2 size={12} />
                          <span>Победа</span>
                        </div>
                      )}
                      {trade.status === 'LOSS' && (
                        <div style={{ ...styles.statusBadge, backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' }}>
                          <XCircle size={12} />
                          <span>Убыток</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Стили компонента
const styles = {
  container: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    color: '#F8FAFC',
    boxSizing: 'border-box',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  statCard: {
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '12px 16px',
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '800',
    marginTop: '4px',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    paddingTop: '4px',
  },
  filterTitle: {
    fontSize: '12px',
    color: '#64748B',
    fontWeight: '600',
  },
  filterTabs: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  filterBtn: {
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#94A3B8',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  filterBtnActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    color: '#FFFFFF',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #334155',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '13px',
  },
  th: {
    backgroundColor: '#0F172A',
    color: '#64748B',
    padding: '12px 16px',
    fontWeight: '700',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #334155',
  },
  tr: {
    borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
    transition: 'background-color 0.15s',
  },
  td: {
    padding: '12px 16px',
    verticalAlign: 'middle',
  },
  emptyTd: {
    padding: '30px',
    textAlign: 'center',
    color: '#64748B',
  },
  directionBadge: {
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetName: {
    fontWeight: '700',
    color: '#F8FAFC',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
  },
};
