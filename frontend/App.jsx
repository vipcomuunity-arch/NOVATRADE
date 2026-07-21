
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  User,
  ChevronDown,
  ChevronUp,
  Activity,
  Clock,
  DollarSign
} from 'lucide-react';

// Регистрация модулей Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ASSETS = [
  { id: 'btc', name: 'BTC / USD', price: 64250.0, category: 'Crypto', payout: 85 },
  { id: 'eth', name: 'ETH / USD', price: 3480.0, category: 'Crypto', payout: 82 },
  { id: 'eurusd', name: 'EUR / USD', price: 1.0850, category: 'Forex', payout: 80 },
  { id: 'gbpusd', name: 'GBP / USD', price: 1.2720, category: 'Forex', payout: 78 },
  { id: 'aapl', name: 'Apple Inc.', price: 214.2, category: 'Stocks', payout: 75 }
];

export default function App() {
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  const [balance, setBalance] = useState(10000.0);
  const [amount, setAmount] = useState(100);
  const [duration, setDuration] = useState('01:00');
  const [priceHistory, setPriceHistory] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);
  const [isAssetMenuOpen, setIsAssetMenuOpen] = useState(false);
  const [activeTrades, setActiveTrades] = useState([]);

  // Инициализация и симуляция изменения цен в реальном времени
  useEffect(() => {
    const initialPrices = [];
    const initialLabels = [];
    let currentPrice = selectedAsset.price;
    const now = new Date();

    for (let i = 20; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 2000);
      initialLabels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      currentPrice += (Math.random() - 0.49) * (currentPrice * 0.001);
      initialPrices.push(parseFloat(currentPrice.toFixed(2)));
    }

    setPriceHistory(initialPrices);
    setTimeLabels(initialLabels);

    const interval = setInterval(() => {
      const newTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setPriceHistory(prev => {
        const lastPrice = prev[prev.length - 1] || selectedAsset.price;
        const change = (Math.random() - 0.49) * (lastPrice * 0.0015);
        const newPrice = parseFloat((lastPrice + change).toFixed(2));
        return [...prev.slice(1), newPrice];
      });
      setTimeLabels(prev => [...prev.slice(1), newTime]);
    }, 1500);

    return () => clearInterval(interval);
  }, [selectedAsset]);

  const currentPrice = priceHistory[priceHistory.length - 1] || selectedAsset.price;
  const previousPrice = priceHistory[priceHistory.length - 2] || currentPrice;
  const isUp = currentPrice >= previousPrice;

  // Обработка покупки (Выше / Ниже)
  const handleTrade = (type) => {
    if (balance < amount) {
      alert('Недостаточно средств на балансе!');
      return;
    }

    setBalance(prev => prev - amount);

    const newTrade = {
      id: Date.now(),
      asset: selectedAsset.name,
      type, // 'UP' или 'DOWN'
      entryPrice: currentPrice,
      amount,
      payout: amount + (amount * (selectedAsset.payout / 100)),
      time: new Date().toLocaleTimeString()
    };

    setActiveTrades(prev => [newTrade, ...prev]);
  };

  // Конфигурация графика
  const chartData = {
    labels: timeLabels,
    datasets: [
      {
        fill: true,
        label: selectedAsset.name,
        data: priceHistory,
        borderColor: isUp ? '#10B981' : '#EF4444',
        backgroundColor: isUp ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1E293B',
        titleColor: '#94A3B8',
        bodyColor: '#F8FAFC',
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748B', maxTicksLimit: 6 }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748B' }
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F172A', color: '#F8FAFC', fontFamily: 'sans-serif' }}>
      {/* Шапка сайта */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', backgroundColor: '#1E293B', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={28} color="#3B82F6" />
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, background: 'linear-gradient(to right, #3B82F6, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Nova Trade
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0F172A', padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155' }}>
            <Wallet size={18} color="#10B981" />
            <span style={{ color: '#94A3B8', fontSize: '14px' }}>Демо-счет:</span>
            <span style={{ fontWeight: 'bold', color: '#10B981' }}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <button style={{ background: '#334155', border: 'none', padding: '8px', borderRadius: '50%', color: '#FFF', cursor: 'pointer' }}>
            <User size={18} />
          </button>
        </div>
      </header>

      {/* Основной контент */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', height: 'calc(100vh - 65px)' }}>
        {/* График и управление активами */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '20px', gap: '20px' }}>
          {/* Селектор активов */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsAssetMenuOpen(!isAssetMenuOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#1E293B', border: '1px solid #334155', color: '#FFF', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}
            >
              <span style={{ fontWeight: 'bold' }}>{selectedAsset.name}</span>
              <span style={{ color: '#10B981', fontSize: '12px', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                +{selectedAsset.payout}%
              </span>
              {isAssetMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isAssetMenuOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', width: '260px', zIndex: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                {ASSETS.map(asset => (
                  <div
                    key={asset.id}
                    onClick={() => { setSelectedAsset(asset); setIsAssetMenuOpen(false); }}
                    style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid #334155' }}
                  >
                    <div>
                      <div style={{ fontWeight: '600' }}>{asset.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{asset.category}</div>
                    </div>
                    <span style={{ color: '#10B981', fontWeight: 'bold' }}>+{asset.payout}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Отображение графика */}
          <div style={{ flex: 1, backgroundColor: '#1E293B', borderRadius: '12px', padding: '20px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <span style={{ fontSize: '14px', color: '#94A3B8' }}>Текущая цена: </span>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: isUp ? '#10B981' : '#EF4444' }}>
                  ${currentPrice.toLocaleString()}
                </span>
              </div>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Панель торговли */}
        <div style={{ backgroundColor: '#1E293B', borderLeft: '1px solid #334155', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '16px', margin: 0, color: '#94A3B8' }}>Панель торговли</h2>

          {/* Поле суммы */}
          <div>
            <label style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '6px' }}>Сумма инвестиции ($)</label>
            <div style={{ position: 'relative' }}>
              <DollarSign size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                style={{ width: '100%', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', padding: '10px 10px 10px 36px', color: '#FFF', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Время экспирации */}
          <div>
            <label style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '6px' }}>Время сделки</label>
            <div style={{ position: 'relative' }}>
              <Clock size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{ width: '100%', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', padding: '10px 10px 10px 36px', color: '#FFF', fontSize: '16px', boxSizing: 'border-box' }}
              >
                <option value="01:00">01:00 мин</option>
                <option value="02:00">02:00 мин</option>
                <option value="05:00">05:00 мин</option>
              </select>
            </div>
          </div>

          {/* Выплата */}
          <div style={{ backgroundColor: '#0F172A', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '12px', color: '#64748B' }}>Чистая прибыль:</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10B981', marginTop: '4px' }}>
              +${(amount * (selectedAsset.payout / 100)).toFixed(2)} ({selectedAsset.payout}%)
            </div>
          </div>

          {/* Кнопки Торговли */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 'auto' }}>
            <button
              onClick={() => handleTrade('UP')}
              style={{ backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '8px', padding: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
            >
              <TrendingUp size={24} />
              ВЫШЕ
            </button>
            <button
              onClick={() => handleTrade('DOWN')}
              style={{ backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', padding: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
            >
              <TrendingDown size={24} />
              НИЖЕ
            </button>
          </div>

          {/* История последних сделок */}
          <div style={{ marginTop: '10px' }}>
            <h3 style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '10px' }}>Открытые сделки</h3>
            <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeTrades.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#64748B', textAlign: 'center', padding: '10px' }}>Сделок пока нет</div>
              ) : (
                activeTrades.map(trade => (
                  <div key={trade.id} style={{ backgroundColor: '#0F172A', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: trade.type === 'UP' ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>
                        {trade.type} ${trade.amount}
                      </span>
                      <div style={{ color: '#64748B', fontSize: '10px' }}>{trade.asset} @ ${trade.entryPrice}</div>
                    </div>
                    <span style={{ color: '#94A3B8' }}>{trade.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
