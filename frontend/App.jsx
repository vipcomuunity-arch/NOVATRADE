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

export const ASSETS = [
  { id: 'btc', name: 'BTC / USD', price: 64250.0, category: 'Crypto', payout: 85 },
  { id: 'eth', name: 'ETH / USD', price: 3480.0, category: 'Crypto', payout: 82 },
  { id: 'eurusd', name: 'EUR / USD', price: 1.0850, category: 'Forex', payout: 80 },
  { id: 'gbpusd', name: 'GBP / USD', price: 1.2720, category: 'Forex', payout: 78 },
  { id: 'aapl', name: 'Apple Inc.', price: 214.2, category: 'Stocks', payout: 75 }
];

// --- 1. КОМПОНЕНТ HEADER С ПРОФИЛЕМ ---
const Header = ({ balance }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#1E293B', borderBottom: '1px solid #334155' }}>
    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>TradeX</div>
    
    {/* Блок профиля */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ backgroundColor: '#0F172A', padding: '8px 15px', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', color: '#F8FAFC' }}>
        ${balance.toFixed(2)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Иван Иванов</div>
          <div style={{ fontSize: '12px', color: '#94A3B8' }}>Профиль</div>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
          ИИ
        </div>
      </div>
    </div>
  </div>
);

// --- 2. КОМПОНЕНТ ВЫБОРА АКТИВА ---
const AssetSelector = ({ assets, selectedAsset, setSelectedAsset }) => (
  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
    {assets.map(asset => (
      <button
        key={asset.id}
        onClick={() => setSelectedAsset(asset)}
        style={{
          padding: '10px 20px',
          backgroundColor: selectedAsset.id === asset.id ? '#3B82F6' : '#1E293B',
          color: '#FFF',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          whiteSpace: 'nowrap'
        }}
      >
        {asset.name} ({asset.payout}%)
      </button>
    ))}
  </div>
);

// --- 3. КОМПОНЕНТ ГРАФИКА ---
const ChartView = ({ selectedAsset, currentPrice, isUp, chartData, chartOptions }) => (
  <div style={{ backgroundColor: '#1E293B', borderRadius: '12px', padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
      <h2 style={{ margin: 0 }}>{selectedAsset.name}</h2>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: isUp ? '#10B981' : '#EF4444' }}>
        {currentPrice.toFixed(selectedAsset.category === 'Forex' ? 4 : 2)}
      </div>
    </div>
    <div style={{ flex: 1, minHeight: '300px' }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  </div>
);

// --- 4. КОМПОНЕНТ ПАНЕЛИ ТОРГОВЛИ ---
const TradingPanel = ({ selectedAsset, amount, setAmount, duration, setDuration, handleTrade, activeTrades }) => (
  <div style={{ backgroundColor: '#1E293B', padding: '20px', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '20px' }}>
    <h3>Новая сделка</h3>
    
    <div>
      <label style={{ display: 'block', marginBottom: '5px', color: '#94A3B8' }}>Сумма ($)</label>
      <input 
        type="number" 
        value={amount} 
        onChange={(e) => setAmount(Number(e.target.value))}
        style={{ width: '100%', padding: '10px', backgroundColor: '#0F172A', border: '1px solid #334155', color: '#FFF', borderRadius: '6px' }}
      />
    </div>

    <div>
      <label style={{ display: 'block', marginBottom: '5px', color: '#94A3B8' }}>Время</label>
      <select 
        value={duration} 
        onChange={(e) => setDuration(e.target.value)}
        style={{ width: '100%', padding: '10px', backgroundColor: '#0F172A', border: '1px solid #334155', color: '#FFF', borderRadius: '6px' }}
      >
        <option value="01:00">1 Минута</option>
        <option value="05:00">5 Минут</option>
        <option value="15:00">15 Минут</option>
      </select>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '14px' }}>
      <span>Доходность ({selectedAsset.payout}%):</span>
      <span style={{ color: '#10B981', fontWeight: 'bold' }}>
        +${(amount * (selectedAsset.payout / 100)).toFixed(2)}
      </span>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
      <button 
        onClick={() => handleTrade('UP')}
        style={{ padding: '15px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
        ВЫШЕ ↗
      </button>
      <button 
        onClick={() => handleTrade('DOWN')}
        style={{ padding: '15px', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
        НИЖЕ ↘
      </button>
    </div>

    {/* Список активных сделок */}
    <div style={{ marginTop: '20px', flex: 1, overflowY: 'auto' }}>
      <h4 style={{ color: '#94A3B8' }}>Активные сделки ({activeTrades.length})</h4>
      {activeTrades.map(trade => (
        <div key={trade.id} style={{ backgroundColor: '#0F172A', padding: '10px', borderRadius: '6px', marginBottom: '10px', fontSize: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>{trade.asset}</span>
            <span style={{ color: trade.type === 'UP' ? '#10B981' : '#EF4444' }}>{trade.type}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
            <span>${trade.amount}</span>
            <span>{trade.time}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ ---
export default function App() {
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  const [balance, setBalance] = useState(10000.0);
  const [amount, setAmount] = useState(100);
  const [duration, setDuration] = useState('01:00');
  const [priceHistory, setPriceHistory] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);
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
      type,
      entryPrice: currentPrice,
      amount,
      payout: amount + (amount * (selectedAsset.payout / 100)),
      time: new Date().toLocaleTimeString()
    };

    setActiveTrades(prev => [newTrade, ...prev]);
  };

  // Конфигурация графика для Chart.js
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
      
      {/* Шапка с профилем */}
      <Header balance={balance} />

      {/* Основной контент */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', height: 'calc(100vh - 75px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '20px', gap: '20px' }}>
          
          <AssetSelector
            assets={ASSETS}
            selectedAsset={selectedAsset}
            setSelectedAsset={setSelectedAsset}
          />

          <ChartView
            selectedAsset={selectedAsset}
            currentPrice={currentPrice}
            isUp={isUp}
            chartData={chartData}
            chartOptions={chartOptions}
          />
        </div>

        <TradingPanel
          selectedAsset={selectedAsset}
          amount={amount}
          setAmount={setAmount}
          duration={duration}
          setDuration={setDuration}
          handleTrade={handleTrade}
          activeTrades={activeTrades}
        />
      </div>
    </div>
  );
}
