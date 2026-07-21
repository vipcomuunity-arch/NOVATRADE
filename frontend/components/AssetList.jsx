
import React, { useState } from 'react';
import {
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  X,
  Layers,
  Sparkles
} from 'lucide-react';

// Дефолтный список активов (если не передан извне)
const DEFAULT_ASSETS = [
  { id: 'btc', name: 'BTC / USD', category: 'Crypto', price: 64250.00, change24h: 2.45, payout: 85 },
  { id: 'eth', name: 'ETH / USD', category: 'Crypto', price: 3480.00, change24h: -1.12, payout: 82 },
  { id: 'sol', name: 'SOL / USD', category: 'Crypto', price: 145.50, change24h: 5.80, payout: 80 },
  { id: 'eurusd', name: 'EUR / USD', category: 'Forex', price: 1.0850, change24h: 0.15, payout: 80 },
  { id: 'gbpusd', name: 'GBP / USD', category: 'Forex', price: 1.2720, change24h: -0.08, payout: 78 },
  { id: 'usdjpy', name: 'USD / JPY', category: 'Forex', price: 157.30, change24h: 0.42, payout: 75 },
  { id: 'aapl', name: 'Apple Inc.', category: 'Stocks', price: 214.20, change24h: 1.25, payout: 75 },
  { id: 'tsla', name: 'Tesla Motors', category: 'Stocks', price: 248.50, change24h: -3.40, payout: 72 },
  { id: 'nvda', name: 'NVIDIA Corp.', category: 'Stocks', price: 128.80, change24h: 4.10, payout: 80 },
  { id: 'gold', name: 'Gold (XAU/USD)', category: 'Commodities', price: 2340.50, change24h: 0.65, payout: 70 },
];

export default function AssetList({
  assets = DEFAULT_ASSETS,
  selectedAssetId = 'btc',
  onSelectAsset,
  onClose
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState(['btc', 'sol', 'aapl']);

  const categories = ['All', 'Favorites', 'Crypto', 'Forex', 'Stocks', 'Commodities'];

  const toggleFavorite = (e, assetId) => {
    e.stopPropagation();
    setFavorites(prev =>
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  // Фильтрация активов
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeCategory === 'Favorites') return favorites.includes(asset.id);
    if (activeCategory !== 'All') return asset.category === activeCategory;

    return true;
  });

  return (
    <div style={styles.overlay}>
      <div style={styles.modalContainer}>
        {/* Шапка модального окна */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="#3B82F6" />
            <h2 style={styles.title}>Выбор торгового актива</h2>
          </div>
          {onClose && (
            <button onClick={onClose} style={styles.closeBtn} title="Закрыть">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Строка поиска */}
        <div style={styles.searchContainer}>
          <Search size={16} color="#64748B" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Поиск по названию или категории (напр. BTC, Forex)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Категории */}
        <div style={styles.categoriesBar}>
          {categories.map(cat => {
            const isFavTab = cat === 'Favorites';
            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  ...styles.categoryTab,
                  ...(isActive ? styles.categoryTabActive : {})
                }}
              >
                {isFavTab && (
                  <Star
                    size={13}
                    color={isActive ? '#F59E0B' : '#94A3B8'}
                    fill={isActive ? '#F59E0B' : 'transparent'}
                  />
                )}
                <span>{cat === 'All' ? 'Все' : cat === 'Favorites' ? 'Избранное' : cat}</span>
              </button>
            );
          })}
        </div>

        {/* Список / Таблица */}
        <div style={styles.listContainer}>
          <div style={styles.tableHeader}>
            <span style={{ flex: 2 }}>Актив</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Текущая цена</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Изменение (24ч)</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Доходность</span>
          </div>

          <div style={styles.rowsWrapper}>
            {filteredAssets.length === 0 ? (
              <div style={styles.emptyState}>Активы не найдены</div>
            ) : (
              filteredAssets.map(asset => {
                const isFav = favorites.includes(asset.id);
                const isSelected = selectedAssetId === asset.id;
                const isUp = asset.change24h >= 0;

                return (
                  <div
                    key={asset.id}
                    onClick={() => {
                      if (onSelectAsset) onSelectAsset(asset);
                      if (onClose) onClose();
                    }}
                    style={{
                      ...styles.assetRow,
                      ...(isSelected ? styles.assetRowSelected : {})
                    }}
                  >
                    {/* Название и Избранное */}
                    <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={(e) => toggleFavorite(e, asset.id)}
                        style={styles.favBtn}
                        title={isFav ? "Убрать из избранного" : "Добавить в избранное"}
                      >
                        <Star
                          size={16}
                          color={isFav ? '#F59E0B' : '#64748B'}
                          fill={isFav ? '#F59E0B' : 'transparent'}
                        />
                      </button>
                      <div>
                        <div style={styles.assetName}>{asset.name}</div>
                        <div style={styles.assetCategory}>{asset.category}</div>
                      </div>
                    </div>

                    {/* Цена */}
                    <div style={{ flex: 1, textAlign: 'right', fontWeight: '600', color: '#F8FAFC' }}>
                      ${asset.price.toLocaleString('en-US', { minimumFractionDigits: asset.price < 10 ? 4 : 2 })}
                    </div>

                    {/* Изменение за 24 часа */}
                    <div style={{
                      flex: 1,
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '4px',
                      color: isUp ? '#10B981' : '#EF4444',
                      fontWeight: '600',
                      fontSize: '13px'
                    }}>
                      {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span>{isUp ? '+' : ''}{asset.change24h}%</span>
                    </div>

                    {/* Процент выплаты */}
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <span style={styles.payoutBadge}>+{asset.payout}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Стили компонента
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '20px',
  },
  modalContainer: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '620px',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 20px',
    borderBottom: '1px solid #334155',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#F8FAFC',
    margin: 0,
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    position: 'relative',
    padding: '14px 20px 8px 20px',
  },
  searchIcon: {
    position: 'absolute',
    left: '32px',
    top: '26px',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 12px 10px 38px',
    color: '#F8FAFC',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  categoriesBar: {
    display: 'flex',
    gap: '6px',
    padding: '8px 20px',
    overflowX: 'auto',
    borderBottom: '1px solid #334155',
  },
  categoryTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '6px 12px',
    color: '#94A3B8',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  categoryTabActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    padding: '10px 20px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #334155',
  },
  rowsWrapper: {
    overflowY: 'auto',
    padding: '6px 0',
    maxHeight: '380px',
  },
  emptyState: {
    padding: '30px',
    textAlign: 'center',
    color: '#64748B',
    fontSize: '14px',
  },
  assetRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
  },
  assetRowSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  favBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
  },
  assetName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#F8FAFC',
  },
  assetCategory: {
    fontSize: '11px',
    color: '#64748B',
  },
  payoutBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: '#10B981',
    fontWeight: '700',
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: '6px',
    display: 'inline-block',
  },
};
