/**
 * frontend/pages/Dashboard.jsx
 * Главная страница торгового терминала NovaTrade.
 * Интегрирует реальный REST API, WebSocket для live-котировок, 
 * интерактивный график (Chart.js) и панель управления сделками.
 */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  Wallet, Layers, ChevronDown, Activity, Clock, DollarSign,
  ArrowUpRight, ArrowDownRight, Zap
} from 'lucide-react';

// Регистрация компонентов Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

// Маппинг UI-кнопок времени в секунды (для бэкенда)
const DURATION_MAP = {
  '5s': 5, '15s': 15, '1m': 60, '5m': 300, '15m': 900
};

export default function Dashboard() {
  // --- Состояния данных ---
  const [balance, setBalance] = useState(0);
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeTrades, setActiveTrades] = useState([]);
  
  // --- Состояния UI и формы ---
  const [tradeAmount, setTradeAmount] = useState(100);
  const [duration, setDuration] = useState('1m');
  const [isLoading, setIsLoading] = useState(true);
  const [isAssetMenuOpen, setIsAssetMenuOpen] = useState(false);

  // --- Состояния Графика ---
  const [priceHistory, setPriceHistory] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);

  const wsRef = useRef(null);

  // ==========================================
  // 1. ЗАГРУЗКА НАЧАЛЬНЫХ ДАННЫХ С БЭКА
  // ==========================================
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        // Параллельные запросы к нашему реальному API
        const [profileRes, assetsRes, tradesRes] = await Promise.all([
          axios.get('/v1/auth/me'),
          axios.get('/v1/trading/assets'),
          axios.get('/v1/trading/trades/active')
        ]);

        setBalance(profileRes.data.user.balance);
        
        const loadedAssets = assetsRes.data.assets;
        setAssets(loadedAssets);
        if (loadedAssets.length > 0) {
          const firstAsset = loadedAssets[0];
          setSelectedAsset(firstAsset);
          // Инициализируем график начальной ценой
          setPriceHistory(Array(20).fill(firstAsset.price));
          const now = new Date();
          setTimeLabels(Array(20).fill(0).map((_, i) => 
            new Date(now.getTime() - (19 - i) * 1000).toLocaleTimeString()
          ));
        }

        setActiveTrades(tradesRes.data.trades);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        // Если токен истек, можно редиректить на /login
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // ==========================================
  // 2. ПОДКЛЮЧЕНИЕ К WEBSOCKET (LIVE-КОТИРОВКИ)
  // ==========================================
  useEffect(() => {
    if (!selectedAsset) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        
        if (msg.type === 'quote_update' && msg.payload.symbol === selectedAsset.id) {
          const newPrice = msg.payload.price;
          
          // Обновляем цену в объекте актива
          setSelectedAsset(prev => ({ ...prev, price: newPrice }));
          
          // Обновляем график
          setPriceHistory(prev => [...prev.slice(1), newPrice]);
          setTimeLabels(prev => [...prev.slice(1), new Date().toLocaleTimeString()]);
        }
        
        if (msg.type === 'balance_update') {
          setBalance(msg.payload.balance);
        }

        if (msg.type === 'trade_opened') {
          setActiveTrades(prev => [msg.payload.trade, ...prev]);
        }

        if (msg.type === 'trade_closed') {
          const closedTrade = msg.payload.trade;
          setActiveTrades(prev => prev.filter(t => t.id !== closedTrade.id));
          setBalance(msg.payload.newBalance);
        }
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    ws.onclose = () => console.log('WS disconnected');
    
    return () => ws.close();
  }, [selectedAsset?.id]); // Переподключаемся, если сменился актив (опционально)

  // ==========================================
  // 3. ТАЙМЕРЫ АКТИВНЫХ СДЕЛОК
  // ==========================================
  useEffect(() => {
    if (activeTrades.length === 0) return;

    const timerInterval = setInterval(() => {
      setActiveTrades(prevTrades => 
        prevTrades.map(trade => {
          const remainingMs = trade.expire_at - Date.now();
          if (remainingMs <= 0) return { ...trade, timer: '00:00' };
          
          const secs = Math.floor(remainingMs / 1000);
          const mins = Math.floor(secs / 60);
          const displaySecs = secs % 60;
          return { ...trade, timer: `${String(mins).padStart(2, '0')}:${String(displaySecs).padStart(2, '0')}` };
        })
      );
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [activeTrades.length]);

  // ==========================================
  // 4. ОБРАБОТКА ОТКРЫТИЯ СДЕЛКИ
  // ==========================================
  const handlePlaceTrade = async (direction) => {
    if (!selectedAsset || balance < tradeAmount) {
      alert('Недостаточно средств или не выбран актив');
      return;
    }

    try {
      await axios.post('/v1/trading/trades', {
        assetId: selectedAsset.id,
        direction: direction, // 'UP' или 'DOWN'
        amount: tradeAmount,
        durationSec: DURATION_MAP[duration] || 60
      });
      
      // Баланс и сделки обновятся автоматически через WebSocket
    } catch (err) {
      console.error('Ошибка открытия сделки:', err);
      alert(err.response?.data?.message || 'Ошибка сервера');
    }
  };

  const handleQuickAmount = (val) => setTradeAmount(prev => Math.max(1, prev + val));

  // ==========================================
  // 5. РЕНДЕРИНГ UI
  // ==========================================
  if (isLoading) return <div className="dashboard-loading">Загрузка терминала...</div>;
  if (!selectedAsset) return <div className="dashboard-loading">Нет доступных активов</div>;

  const isUp = priceHistory.length > 1 ? priceHistory[priceHistory.length - 1] >= priceHistory[priceHistory.length - 2] : true;
  const potentialProfit = ((tradeAmount * selectedAsset.payout) / 100).toFixed(2);

  // Конфигурация Chart.js
  const chartData = {
    labels: timeLabels,
    datasets: [{
      fill: true,
      data: priceHistory,
      borderColor: isUp ? '#10B981' : '#EF4444',
      backgroundColor: isUp ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      tension: 0.3,
      borderWidth: 2,
      pointRadius: 0,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748B', maxTicksLimit: 6 } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748B' } }
    }
  };

  return (
    <div className="dashboard-container">
      {/* Верхний бар сводки */}
      <div className="top-summary-bar">
        <div className="balance-card">
          <div className="balance-header">
            <Wallet size={16} color="#3B82F6" />
            <span className="balance-label">Торговый счет</span>
            <span className="account-badge demo">DEMO</span>
          </div>
          <div className="balance-amount">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>

        <div className="asset-selector-card" onClick={() => setIsAssetMenuOpen(!isAssetMenuOpen)}>
          <div className="asset-info">
            <Layers size={20} color="#3B82F6" />
            <div>
              <div className="asset-name">{selectedAsset.name}</div>
              <div className="asset-payout">Выплата: +{selectedAsset.payout}%</div>
            </div>
          </div>
          <div className="asset-price-block">
            <div className="asset-price">${selectedAsset.price.toLocaleString()}</div>
            <ChevronDown size={18} color="#64748B" />
          </div>
        </div>

        <div className="mini-stats-card">
          <div className="mini-stat-item">
            <span className="mini-stat-label">Активные сделки</span>
            <span className="mini-stat-val">{activeTrades.length}</span>
          </div>
          <div className="mini-stat-item">
            <span className="mini-stat-label">Потенциал</span>
            <span className="mini-stat-val profit">+${potentialProfit}</span>
          </div>
        </div>
      </div>

      {/* Основная сетка: График + Панель управления */}
      <div className="main-grid">
        <div className="chart-section">
          <div className="chart-header">
            <div className="chart-title">
              <Activity size={18} color="#3B82F6" />
              <span>Котировки в реальном времени</span>
            </div>
          </div>
          <div className="chart-area">
            <div className="live-price-tag">
              <span className="pulse-dot" />
              ${selectedAsset.price.toLocaleString()}
            </div>
            {/* Настоящий график Chart.js */}
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="trade-panel">
          <h3 className="panel-title">Открыть сделку</h3>
          
          <div className="input-section">
            <label className="input-label"><Clock size={14} color="#64748B" /> Время экспирации</label>
            <div className="duration-grid">
              {Object.keys(DURATION_MAP).map(d => (
                <button key={d} onClick={() => setDuration(d)} className={`duration-btn ${duration === d ? 'active' : ''}`}>{d}</button>
              ))}
            </div>
          </div>

          <div className="input-section">
            <label className="input-label"><DollarSign size={14} color="#64748B" /> Сумма инвестиции</label>
            <div className="amount-input-wrapper">
              <span className="currency-sign">$</span>
              <input type="number" value={tradeAmount} onChange={(e) => setTradeAmount(Math.max(1, Number(e.target.value)))} className="amount-input" />
            </div>
            <div className="quick-amount-row">
              {[10, 50, 100, 500].map(val => (
                <button key={val} onClick={() => handleQuickAmount(val)} className="quick-btn">+${val}</button>
              ))}
            </div>
          </div>

          <div className="payout-card">
            <span className="payout-label">Чистая прибыль:</span>
            <span className="payout-value">+${potentialProfit} ({selectedAsset.payout}%)</span>
          </div>

          <div className="action-buttons-group">
            <button onClick={() => handlePlaceTrade('UP')} className="btn-trade btn-up">
              <ArrowUpRight size={22} /> <span>ВЫШЕ</span>
            </button>
            <button onClick={() => handlePlaceTrade('DOWN')} className="btn-trade btn-down">
              <ArrowDownRight size={22} /> <span>НИЖЕ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Нижняя секция: Активные сделки */}
      <div className="active-trades-section">
        <div className="active-trades-header">
          <div className="trades-title"><Zap size={18} color="#F59E0B" /> <h3>Открытые позиции</h3></div>
          <span className="active-count-badge">{activeTrades.length}</span>
        </div>
        
        {activeTrades.length === 0 ? (
          <div className="empty-trades">Нет активных сделок на данный момент</div>
        ) : (
          <div className="trades-grid">
            {activeTrades.map(trade => (
              <div key={trade.id} className="trade-card">
                <div className="trade-card-header">
                  <span className="trade-asset">{trade.asset_id}</span>
                  <span className={`direction-badge ${trade.direction === 'UP' ? 'up' : 'down'}`}>
                    {trade.direction === 'UP' ? 'ВЫШЕ ▲' : 'НИЖЕ ▼'}
                  </span>
                </div>
                <div className="trade-details">
                  <div><span className="detail-label">Инвестиция</span><span className="detail-value">${trade.amount}</span></div>
                  <div><span className="detail-label">Вход</span><span className="detail-value">${trade.entry_price}</span></div>
                  <div><span className="detail-label">Таймер</span><span className="detail-value timer">{trade.timer || '00:00'}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
