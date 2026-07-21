
import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Activity,
  ChevronDown,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Dashboard({
  onOpenAssetList,
  selectedAsset = { id: 'btc', name: 'BTC / USD', price: 64250.00, change24h: 2.45, payout: 85 },
  balance = 12450.00,
  accountType = 'DEMO', // 'DEMO' | 'REAL'
  onSwitchAccountType
}) {
  const [tradeAmount, setTradeAmount] = useState(100);
  const [duration, setDuration] = useState('1m'); // '5s', '1m', '5m', '15m'
  const [activeTrades, setActiveTrades] = useState([
    { id: 't1', asset: 'BTC / USD', type: 'UP', amount: 100, entryPrice: 64180.00, timer: '00:42', payout: 85 },
    { id: 't2', asset: 'ETH / USD', type: 'DOWN', amount: 250, entryPrice: 3482.10, timer: '01:15', payout: 82 },
  ]);

  const handleQuickAmount = (val) => {
    setTradeAmount(prev => Math.max(1, prev + val));
  };

  const handlePlaceTrade = (type) => {
    const newTrade = {
      id: `t-${Date.now()}`,
      asset: selectedAsset.name,
      type: type, // 'UP' | 'DOWN'
      amount: Number(tradeAmount),
      entryPrice: selectedAsset.price,
      timer: duration === '5s' ? '00:05' : duration === '1m' ? '01:00' : '05:00',
      payout: selectedAsset.payout
    };
    setActiveTrades([newTrade, ...activeTrades]);
  };

  return (
    <div style={styles.container}>
      {/* Верхний бар сводки */}
      <div style={styles.topSummaryBar}>
        {/* Выбор счета */}
        <div style={styles.balanceCard}>
          <div style={styles.balanceHeader}>
            <Wallet size={16} color="#3B82F6" />
            <span style={styles.balanceLabel}>Торговый счет</span>
            <span style={{
              ...styles.accountBadge,
              backgroundColor: accountType === 'DEMO' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: accountType === 'DEMO' ? '#F59E0B' : '#10B981'
            }}>
              {accountType}
            </span>
          </div>
          <div style={styles.balanceAmount}>
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Выбранный актив */}
        <div style={styles.assetSelectorCard} onClick={onOpenAssetList}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={20} color="#3B82F6" />
            <div>
              <div style={styles.assetName}>{selectedAsset.name}</div>
              <div style={styles.assetPayout}>Выплата: +{selectedAsset.payout}%</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={styles.assetPrice}>${selectedAsset.price.toLocaleString()}</div>
              <div style={{
                fontSize: '11px',
                fontWeight: '700',
                color: selectedAsset.change24h >= 0 ? '#10B981' : '#EF4444'
              }}>
                {selectedAsset.change24h >= 0 ? '+' : ''}{selectedAsset.change24h}%
              </div>
            </div>
            <ChevronDown size={18} color="#64748B" />
          </div>
        </div>

        {/* Статистика за сессию */}
        <div style={styles.miniStatsCard}>
          <div style={styles.miniStatItem}>
            <span style={styles.miniStatLabel}>Активные сделки</span>
            <span style={styles.miniStatVal}>{activeTrades.length}</span>
          </div>
          <div style={styles.miniStatItem}>
            <span style={styles.miniStatLabel}>Профит за день</span>
            <span style={{ ...styles.miniStatVal, color: '#10B981' }}>+$345.00</span>
          </div>
        </div>
      </div>

      {/* Основная сетка: График + Панель управления ордерами */}
      <div style={styles.mainGrid}>
        {/* Область графика (Плейсхолдер / Интеграция) */}
        <div style={styles.chartSection}>
          <div style={styles.chartHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#3B82F6" />
              <span style={{ fontWeight: '700', fontSize: '14px' }}>Котировки в реальном времени</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['1M', '5M', '15M', '1H'].map(tf => (
                <span key={tf} style={styles.tfChip}>{tf}</span>
              ))}
            </div>
          </div>

          {/* Визуальная имитация графика */}
          <div style={styles.chartArea}>
            <div style={styles.livePriceTag}>
              <span style={styles.pulseDot} />
              ${selectedAsset.price.toLocaleString()}
            </div>

            <div style={styles.chartGridLines}>
              <div style={styles.gridLine} />
              <div style={styles.gridLine} />
              <div style={styles.gridLine} />
            </div>

            <p style={styles.chartPlaceholderText}>
              [ Область графика Canvas / TradingView ]
            </p>
          </div>
        </div>

        {/* Торговая панель (Панель ордеров) */}
        <div style={styles.tradePanel}>
          <h3 style={styles.panelTitle}>Открыть сделку</h3>

          {/* Выбор времени экспирации */}
          <div style={styles.inputSection}>
            <label style={styles.inputLabel}>
              <Clock size={14} color="#64748B" />
              Время экспирации
            </label>
            <div style={styles.durationGrid}>
              {['5s', '1m', '5m', '15m'].map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  style={{
                    ...styles.durationBtn,
                    ...(duration === d ? styles.durationBtnActive : {})
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Поле суммы инвестиции */}
          <div style={styles.inputSection}>
            <label style={styles.inputLabel}>
              <DollarSign size={14} color="#64748B" />
              Сумма инвестиции
            </label>
            <div style={styles.amountInputWrapper}>
              <span style={{ color: '#64748B', fontWeight: '700' }}>$</span>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(Math.max(1, Number(e.target.value)))}
                style={styles.amountInput}
              />
            </div>
            <div style={styles.quickAmountRow}>
              {[+10, +50, +100, +500].map(val => (
                <button
                  key={val}
                  onClick={() => handleQuickAmount(val)}
                  style={styles.quickBtn}
                >
                  +${val}
                </button>
              ))}
            </div>
          </div>

          {/* Расчёт потенциальной выплаты */}
          <div style={styles.payoutCard}>
            <span style={{ color: '#94A3B8', fontSize: '12px' }}>Чистая прибыль:</span>
            <span style={styles.payoutValue}>
              +${((tradeAmount * selectedAsset.payout) / 100).toFixed(2)} ({selectedAsset.payout}%)
            </span>
          </div>

          {/* Кнопки сделки ВЫШЕ / НИЖЕ */}
          <div style={styles.actionButtonsGroup}>
            <button
              onClick={() => handlePlaceTrade('UP')}
              style={styles.btnUp}
            >
              <div style={styles.btnContent}>
                <ArrowUpRight size={22} />
                <span style={styles.btnText}>ВЫШЕ</span>
              </div>
            </button>

            <button
              onClick={() => handlePlaceTrade('DOWN')}
              style={styles.btnDown}
            >
              <div style={styles.btnContent}>
                <ArrowDownRight size={22} />
                <span style={styles.btnText}>НИЖЕ</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Нижняя секция: Активные сделки */}
      <div style={styles.activeTradesSection}>
        <div style={styles.activeTradesHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="#F59E0B" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Открытые позиции</h3>
          </div>
          <span style={styles.activeCountBadge}>{activeTrades.length}</span>
        </div>

        {activeTrades.length === 0 ? (
          <div style={styles.emptyTrades}>Нет активных сделок на данный момент</div>
        ) : (
          <div style={styles.tradesGrid}>
            {activeTrades.map(trade => (
              <div key={trade.id} style={styles.tradeCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px' }}>{trade.asset}</span>
                  <span style={{
                    ...styles.directionBadge,
                    backgroundColor: trade.type === 'UP' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: trade.type === 'UP' ? '#10B981' : '#EF4444'
                  }}>
                    {trade.type === 'UP' ? 'ВЫШЕ ▲' : 'НИЖЕ ▼'}
                  </span>
                </div>

                <div style={styles.tradeDetails}>
                  <div>
                    <span style={styles.detailLabel}>Инвестиция</span>
                    <span style={styles.detailValue}>${trade.amount}</span>
                  </div>
                  <div>
                    <span style={styles.detailLabel}>Вход</span>
                    <span style={styles.detailValue}>${trade.entryPrice}</span>
                  </div>
                  <div>
                    <span style={styles.detailLabel}>Таймер</span>
                    <span style={{ ...styles.detailValue, color: '#F59E0B' }}>{trade.timer}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Стили
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    color: '#F8FAFC',
    width: '100%',
    boxSizing: 'border-box'
  },
  topSummaryBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '12px'
  },
  balanceCard: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '14px 18px'
  },
  balanceHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px'
  },
  balanceLabel: {
    fontSize: '12px',
    color: '#94A3B8',
    fontWeight: '600'
  },
  accountBadge: {
    marginLeft: 'auto',
    fontSize: '10px',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  balanceAmount: {
    fontSize: '22px',
    fontWeight: '800'
  },
  assetSelectorCard: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '14px 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  assetName: {
    fontWeight: '700',
    fontSize: '15px'
  },
  assetPayout: {
    fontSize: '11px',
    color: '#10B981',
    fontWeight: '700'
  },
  assetPrice: {
    fontWeight: '700',
    fontSize: '15px'
  },
  miniStatsCard: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '14px 18px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  miniStatItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },
  miniStatLabel: {
    fontSize: '11px',
    color: '#64748B',
    fontWeight: '600'
  },
  miniStatVal: {
    fontSize: '16px',
    fontWeight: '800'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '16px',
    alignItems: 'stretch'
  },
  chartSection: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minHeight: '420px'
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #334155',
    paddingBottom: '10px'
  },
  tfChip: {
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#94A3B8'
  },
  chartArea: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: '8px',
    border: '1px solid #334155',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  livePriceTag: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    border: '1px solid #3B82F6',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#3B82F6',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6'
  },
  chartGridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px 0',
    opacity: 0.2,
    pointerEvents: 'none'
  },
  gridLine: {
    borderTop: '1px dashed #64748B',
    width: '100%'
  },
  chartPlaceholderText: {
    color: '#64748B',
    fontSize: '13px',
    fontWeight: '600'
  },
  tradePanel: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  panelTitle: {
    fontSize: '16px',
    fontWeight: '800',
    margin: 0
  },
  inputSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  inputLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#94A3B8',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  durationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '6px'
  },
  durationBtn: {
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '8px',
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer'
  },
  durationBtnActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    color: '#FFF'
  },
  amountInputWrapper: {
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  amountInput: {
    width: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#FFF',
    fontWeight: '800',
    fontSize: '16px'
  },
  quickAmountRow: {
    display: 'flex',
    gap: '6px'
  },
  quickBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '4px',
    color: '#94A3B8',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  payoutCard: {
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  payoutValue: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: '13px'
  },
  actionButtonsGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: 'auto'
  },
  btnUp: {
    backgroundColor: '#10B981',
    border: 'none',
    borderRadius: '10px',
    padding: '14px',
    color: '#FFF',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
    transition: 'transform 0.1s'
  },
  btnDown: {
    backgroundColor: '#EF4444',
    border: 'none',
    borderRadius: '10px',
    padding: '14px',
    color: '#FFF',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
    transition: 'transform 0.1s'
  },
  btnContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  btnText: {
    fontSize: '16px',
    fontWeight: '900',
    letterSpacing: '0.5px'
  },
  activeTradesSection: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  activeTradesHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  activeCountBadge: {
    backgroundColor: '#334155',
    color: '#FFF',
    fontSize: '12px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '10px'
  },
  emptyTrades: {
    textAlign: 'center',
    padding: '20px',
    color: '#64748B',
    fontSize: '13px'
  },
  tradesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '10px'
  },
  tradeCard: {
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  directionBadge: {
    fontSize: '11px',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  tradeDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    borderTop: '1px solid #334155',
    paddingTop: '8px'
  },
  detailLabel: {
    color: '#64748B',
    display: 'block',
    fontSize: '10px'
  },
  detailValue: {
    fontWeight: '700'
  }
};
