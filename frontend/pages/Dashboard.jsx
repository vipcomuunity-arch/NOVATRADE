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
  accountType = 'DEMO',
  onSwitchAccountType
}) {
  const [tradeAmount, setTradeAmount] = useState(100);
  const [duration, setDuration] = useState('1m');
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
      type: type,
      amount: Number(tradeAmount),
      entryPrice: selectedAsset.price,
      timer: duration === '5s' ? '00:05' : duration === '1m' ? '01:00' : '05:00',
      payout: selectedAsset.payout
    };
    setActiveTrades([newTrade, ...activeTrades]);
  };

  return (
    <div className="dashboard-container">
      <div className="top-summary-bar">
        <div className="balance-card">
          <div className="balance-header">
            <Wallet size={16} color="#3B82F6" />
            <span className="balance-label">Торговый счет</span>
            <span className={`account-badge ${accountType === 'DEMO' ? 'demo' : 'real'}`}>
              {accountType}
            </span>
          </div>
          <div className="balance-amount">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="asset-selector-card" onClick={onOpenAssetList}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={20} color="#3B82F6" />
            <div>
              <div className="asset-name">{selectedAsset.name}</div>
              <div className="asset-payout">Выплата: +{selectedAsset.payout}%</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <div className="asset-price">${selectedAsset.price.toLocaleString()}</div>
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

        <div className="mini-stats-card">
          <div className="mini-stat-item">
            <span className="mini-stat-label">Активные сделки</span>
            <span className="mini-stat-val">{activeTrades.length}</span>
          </div>
          <div className="mini-stat-item">
            <span className="mini-stat-label">Профит за день</span>
            <span className="mini-stat-val profit">+$345.00</span>
          </div>
        </div>
      </div>

      <div className="main-grid">
        <div className="chart-section">
          <div className="chart-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#3B82F6" />
              <span style={{ fontWeight: '700', fontSize: '14px' }}>Котировки в реальном времени</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['1M', '5M', '15M', '1H'].map(tf => (
                <span key={tf} className="tf-chip">{tf}</span>
              ))}
            </div>
          </div>
          <div className="chart-area">
            <div className="live-price-tag">
              <span className="pulse-dot" />
              ${selectedAsset.price.toLocaleString()}
            </div>
            <div className="chart-grid-lines">
              <div className="grid-line" />
              <div className="grid-line" />
              <div className="grid-line" />
            </div>
            <p className="chart-placeholder-text">
              [ Область графика Canvas / TradingView ]
            </p>
          </div>
        </div>

        <div className="trade-panel">
          <h3 className="panel-title">Открыть сделку</h3>
          <div className="input-section">
            <label className="input-label">
              <Clock size={14} color="#64748B" />
              Время экспирации
            </label>
            <div className="duration-grid">
              {['5s', '1m', '5m', '15m'].map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`duration-btn ${duration === d ? 'active' : ''}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="input-section">
            <label className="input-label">
              <DollarSign size={14} color="#64748B" />
              Сумма инвестиции
            </label>
            <div className="amount-input-wrapper">
              <span className="currency-sign">$</span>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(Math.max(1, Number(e.target.value)))}
                className="amount-input"
              />
            </div>
            <div className="quick-amount-row">
              {[+10, +50, +100, +500].map(val => (
                <button
                  key={val}
                  onClick={() => handleQuickAmount(val)}
                  className="quick-btn"
                >
                  +${val}
                </button>
              ))}
            </div>
          </div>

          <div className="payout-card">
            <span style={{ color: '#94A3B8', fontSize: '12px' }}>Чистая прибыль:</span>
            <span className="payout-value">
              +${((tradeAmount * selectedAsset.payout) / 100).toFixed(2)} ({selectedAsset.payout}%)
            </span>
          </div>

          <div className="action-buttons-group">
            <button onClick={() => handlePlaceTrade('UP')} className="btn-trade btn-up">
              <div className="btn-content">
                <ArrowUpRight size={22} />
                <span className="btn-text">ВЫШЕ</span>
              </div>
            </button>
            <button onClick={() => handlePlaceTrade('DOWN')} className="btn-trade btn-down">
              <div className="btn-content">
                <ArrowDownRight size={22} />
                <span className="btn-text">НИЖЕ</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="active-trades-section">
        <div className="active-trades-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="#F59E0B" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Открытые позиции</h3>
          </div>
          <span className="active-count-badge">{activeTrades.length}</span>
        </div>
        {activeTrades.length === 0 ? (
          <div className="empty-trades">Нет активных сделок на данный момент</div>
        ) : (
          <div className="trades-grid">
            {activeTrades.map(trade => (
              <div key={trade.id} className="trade-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px' }}>{trade.asset}</span>
                  <span className={`direction-badge ${trade.type === 'UP' ? 'up' : 'down'}`}>
                    {trade.type === 'UP' ? 'ВЫШЕ ▲' : 'НИЖЕ ▼'}
                  </span>
                </div>
                <div className="trade-details">
                  <div>
                    <span className="detail-label">Инвестиция</span>
                    <span className="detail-value">${trade.amount}</span>
                  </div>
                  <div>
                    <span className="detail-label">Вход</span>
                    <span className="detail-value">${trade.entryPrice}</span>
                  </div>
                  <div>
                    <span className="detail-label">Таймер</span>
                    <span className="detail-value timer">{trade.timer}</span>
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
