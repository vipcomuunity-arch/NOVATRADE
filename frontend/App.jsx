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

// Импорт модульных компонентов
import Header from './components/Header';
import AssetSelector from './components/AssetSelector';
import ChartView from './components/Chart';
import TradingPanel from './components/TradingPanel';

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
      {/* Шапка */}
      <Header balance={balance} />

      {/* Основной контент */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', height: 'calc(100vh - 65px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '20px', gap: '20px' }}>
          {/* Селектор активов */}
          <AssetSelector
            assets={ASSETS}
            selectedAsset={selectedAsset}
            setSelectedAsset={setSelectedAsset}
            isAssetMenuOpen={isAssetMenuOpen}
            setIsAssetMenuOpen={setIsAssetMenuOpen}
          />

          {/* График */}
          <ChartView
            selectedAsset={selectedAsset}
            currentPrice={currentPrice}
            isUp={isUp}
            chartData={chartData}
            chartOptions={chartOptions}
          />
        </div>

        {/* Панель торговли */}
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
