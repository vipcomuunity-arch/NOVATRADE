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

// Импорт вашего API сервиса
import api from './services/api'; //

// Регистрация модулей Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function App() {
  // Состояния для хранения реальных данных с сервера
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [balance, setBalance] = useState(0);
  
  const [amount, setAmount] = useState(100);
  const [duration, setDuration] = useState('01:00');
  const [priceHistory, setPriceHistory] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);
  const [isAssetMenuOpen, setIsAssetMenuOpen] = useState(false);
  const [activeTrades, setActiveTrades] = useState([]);
  
  // Состояния загрузки и ошибок
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Инициализация приложения: запрос данных с сервера
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Получаем профиль (с балансом) и доступные активы параллельно
        const [profileData, assetsData] = await Promise.all([
          api.auth.getMe(),
          api.trading.getAssets()
        ]);

        if (profileData && profileData.user) {
          setBalance(profileData.user.balance);
        }

        if (assetsData && assetsData.assets && assetsData.assets.length > 0) {
          setAssets(assetsData.assets);
          setSelectedAsset(assetsData.assets[0]); // Выбираем первый актив по умолчанию
          
          // Подготавливаем начальный график отталкиваясь от реальной цены актива
          const basePrice = assetsData.assets[0].price;
          setPriceHistory(Array(20).fill(basePrice));
          
          const now = new Date();
          setTimeLabels(Array(20).fill(0).map((_, i) => 
            new Date(now.getTime() - (19 - i) * 2000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          ));
        }
      } catch (err) {
        console.error('Ошибка загрузки:', err);
        setError('Нет соединения с API. Проверьте токен авторизации или URL сервера.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // 2. Симуляция движения графика (пока на сервере нет WebSockets)
  useEffect(() => {
    if (!selectedAsset) return;

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

  // 3. Отправка реального запроса на создание сделки
  const handleTrade = async (type) => {
    if (balance < amount) {
      alert('Недостаточно средств на балансе!');
      return;
    }

    try {
      // Вызываем API для совершения сделки[cite: 1]
      await api.trading.placeTrade({
        assetId: selectedAsset.id,
        type: type, // 'UP' или 'DOWN'
        amount: amount,
        duration: duration,
        accountType: 'REAL'
      });

      // Локально обновляем баланс (в реальном приложении лучше заново запросить api.trading.getBalance())
      setBalance(prev => prev - amount);

      const currentPrice = priceHistory[priceHistory.length - 1] || selectedAsset.price;
      
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
    } catch (err) {
      console.error(err);
      alert('Ошибка при открытии сделки: ' + (err.message || 'Сбой сервера'));
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', color: '#fff' }}>Подключение к серверу...</div>;
  if (error) return <div style={{ padding: '2rem', color: '#EF4444' }}>{error}</div>;
  if (!selectedAsset) return <div style={{ padding: '2rem', color: '#fff' }}>Активы не загружены</div>;

  const currentPrice = priceHistory[priceHistory.length - 1] || selectedAsset.price;
  const previousPrice = priceHistory[priceHistory.length - 2] || currentPrice;
  const isUp = currentPrice >= previousPrice;

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
      <Header balance={balance} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', height: 'calc(100vh - 65px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '20px', gap: '20px' }}>
          <AssetSelector
            assets={assets}
            selectedAsset={selectedAsset}
            setSelectedAsset={setSelectedAsset}
            isAssetMenuOpen={isAssetMenuOpen}
            setIsAssetMenuOpen={setIsAssetMenuOpen}
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
