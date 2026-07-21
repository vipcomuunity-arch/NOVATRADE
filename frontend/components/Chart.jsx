
import React, { useState } from 'react';
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
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Grid,
  Maximize2,
  Activity
} from 'lucide-react';

// Регистрация необходимых модулей Chart.js
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

export default function Chart({
  selectedAsset = { name: 'BTC / USD', price: 64250.0, payout: 85, category: 'Crypto' },
  assets = [],
  onSelectAsset,
  priceHistory = [],
  timeLabels = []
}) {
  const [isAssetMenuOpen, setIsAssetMenuOpen] = useState(false);
  const [timeframe, setTimeframe] = useState('1M');
  const [showGrid, setShowGrid] = useState(true);

  // Вычисление динамики цены
  const currentPrice = priceHistory[priceHistory.length - 1] || selectedAsset.price;
  const initialPrice = priceHistory[0] || currentPrice;
  const priceChange = currentPrice - initialPrice;
  const percentChange = ((priceChange / (initialPrice || 1)) * 100).toFixed(2);
  const isUp = priceChange >= 0;

  // Конфигурация данных для Chart.js
  const chartData = {
    labels: timeLabels,
    datasets: [
      {
        fill: true,
        label: selectedAsset.name,
        data: priceHistory,
        borderColor: isUp ? '#10B981' : '#EF4444',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          if (isUp) {
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
          } else {
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
          }
          return gradient;
        },
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: isUp ? '#10B981' : '#EF4444',
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  // Опции графика
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#0F172A',
        titleColor: '#94A3B8',
        bodyColor: '#F8FAFC',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => `Цена: $${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: showGrid,
          color: 'rgba(51, 65, 85, 0.3)',
        },
        ticks: {
          color: '#64748B',
          maxTicksLimit: 7,
          font: { size: 11 },
        },
      },
      y: {
        display: true,
        position: 'right',
        grid: {
          display: showGrid,
          color: 'rgba(51, 65, 85, 0.3)',
        },
        ticks: {
          color: '#64748B',
          font: { size: 11 },
          callback: (value) => `$${value}`,
        },
      },
    },
  };

  return (
    <div style={styles.container}>
      {/* Шапка графика / Выбор актива */}
      <div style={styles.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Выпадающее меню активов */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsAssetMenuOpen(!isAssetMenuOpen)}
              style={styles.assetSelector}
            >
              <Activity size={18} color="#3B82F6" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700', fontSize: '14px' }}>{selectedAsset.name}</div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>{selectedAsset.category}</div>
              </div>
              <span style={styles.payoutTag}>+{selectedAsset.payout}%</span>
              {isAssetMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Выпадающий список */}
            {isAssetMenuOpen && (
              <div style={styles.dropdown}>
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => {
                      if (onSelectAsset) onSelectAsset(asset);
                      setIsAssetMenuOpen(false);
                    }}
                    style={{
                      ...styles.dropdownItem,
                      backgroundColor: asset.id === selectedAsset.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13px' }}>{asset.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{asset.category}</div>
                    </div>
                    <span style={styles.payoutTag}>+{asset.payout}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Текущая цена и процент изменения */}
          <div style={styles.priceContainer}>
            <span style={{ ...styles.currentPrice, color: isUp ? '#10B981' : '#EF4444' }}>
              ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <div style={{ ...styles.changeBadge, backgroundColor: isUp ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: isUp ? '#10B981' : '#EF4444' }}>
              {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{isUp ? '+' : ''}{percentChange}%</span>
            </div>
          </div>
        </div>

        {/* Панель инструментов графика */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Таймфреймы */}
          <div style={styles.timeframeGroup}>
            {['1M', '5M', '15M', '1H', '1D'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  ...styles.timeframeBtn,
                  backgroundColor: timeframe === tf ? '#3B82F6' : 'transparent',
                  color: timeframe === tf ? '#FFFFFF' : '#94A3B8',
                }}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Переключатель сетки */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            style={{ ...styles.toolBtn, color: showGrid ? '#3B82F6' : '#64748B' }}
            title="Переключить сетку"
          >
            <Grid size={18} />
          </button>
        </div>
      </div>

      {/* Сам холст графика */}
      <div style={styles.chartWrapper}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

// Стили компонента
const styles = {
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: '12px',
    border: '1px solid #334155',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxSizing: 'border-box',
    minHeight: '400px',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  assetSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '8px 14px',
    color: '#F8FAFC',
    cursor: 'pointer',
    userSelect: 'none',
  },
  payoutTag: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    width: '240px',
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    zIndex: 50,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: '10px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    borderBottom: '1px solid #1E293B',
    transition: 'background-color 0.15s',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  currentPrice: {
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  changeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
  },
  timeframeGroup: {
    display: 'flex',
    backgroundColor: '#0F172A',
    borderRadius: '8px',
    padding: '3px',
    border: '1px solid #334155',
  },
  timeframeBtn: {
    border: 'none',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  toolBtn: {
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartWrapper: {
    flex: 1,
    position: 'relative',
    width: '100%',
    minHeight: '300px',
  },
};
