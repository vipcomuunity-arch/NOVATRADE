
import React from 'react';
import {
  Clock,
  Zap,
  TrendingUp,
  BarChart2,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function Timeframes({
  selectedTimeframe = '1M',
  onSelectTimeframe,
  chartType = 'line',
  onSelectChartType
}) {
  // Категории таймфреймов
  const timeframeGroups = [
    {
      category: 'Спринт',
      icon: Zap,
      items: [
        { id: '5s', label: '5s', desc: '5 секунд' },
        { id: '10s', label: '10s', desc: '10 секунд' },
        { id: '30s', label: '30s', desc: '30 секунд' },
      ],
    },
    {
      category: 'Минуты',
      icon: Clock,
      items: [
        { id: '1M', label: '1M', desc: '1 минута' },
        { id: '5M', label: '5M', desc: '5 минут' },
        { id: '15M', label: '15M', desc: '15 минут' },
        { id: '30M', label: '30M', desc: '30 минут' },
      ],
    },
    {
      category: 'Часы / Дни',
      icon: Calendar,
      items: [
        { id: '1H', label: '1H', desc: '1 час' },
        { id: '4H', label: '4H', desc: '4 часа' },
        { id: '1D', label: '1D', desc: '1 день' },
      ],
    },
  ];

  return (
    <div style={styles.container}>
      {/* Левая секция: Группы таймфреймов */}
      <div style={styles.groupsWrapper}>
        {timeframeGroups.map((group) => {
          const GroupIcon = group.icon;
          return (
            <div key={group.category} style={styles.group}>
              <div style={styles.groupHeader}>
                <GroupIcon size={12} color="#64748B" />
                <span style={styles.groupTitle}>{group.category}</span>
              </div>
              <div style={styles.buttonGrid}>
                {group.items.map((tf) => {
                  const isActive = selectedTimeframe === tf.id;
                  return (
                    <button
                      key={tf.id}
                      onClick={() => onSelectTimeframe && onSelectTimeframe(tf.id)}
                      style={{
                        ...styles.tfBtn,
                        ...(isActive ? styles.tfBtnActive : {}),
                      }}
                      title={tf.desc}
                    >
                      {tf.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Правая секция: Переключатель типа графика (Линия / Свечи) */}
      <div style={styles.chartTypeWrapper}>
        <span style={styles.chartTypeLabel}>Тип графика</span>
        <div style={styles.typeSelector}>
          <button
            onClick={() => onSelectChartType && onSelectChartType('line')}
            style={{
              ...styles.typeBtn,
              backgroundColor: chartType === 'line' ? '#3B82F6' : 'transparent',
              color: chartType === 'line' ? '#FFFFFF' : '#94A3B8',
            }}
            title="Линейный график"
          >
            <TrendingUp size={16} />
            <span style={styles.typeBtnText}>Линия</span>
          </button>

          <button
            onClick={() => onSelectChartType && onSelectChartType('candles')}
            style={{
              ...styles.typeBtn,
              backgroundColor: chartType === 'candles' ? '#3B82F6' : 'transparent',
              color: chartType === 'candles' ? '#FFFFFF' : '#94A3B8',
            }}
            title="Японские свечи"
          >
            <BarChart2 size={16} />
            <span style={styles.typeBtnText}>Свечи</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Стили компонента
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '8px 14px',
    gap: '16px',
    userSelect: 'none',
    flexWrap: 'wrap',
  },
  groupsWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  groupTitle: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  buttonGrid: {
    display: 'flex',
    gap: '4px',
  },
  tfBtn: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#94A3B8',
    padding: '5px 10px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tfBtnActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    color: '#FFFFFF',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
  },
  chartTypeWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderLeft: '1px solid #334155',
    paddingLeft: '16px',
  },
  chartTypeLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748B',
  },
  typeSelector: {
    display: 'flex',
    backgroundColor: '#1E293B',
    borderRadius: '8px',
    padding: '3px',
    border: '1px solid #334155',
  },
  typeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: 'none',
    borderRadius: '6px',
    padding: '5px 10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  typeBtnText: {
    fontSize: '12px',
    fontWeight: '600',
  },
};
