/**
 * frontend/pages/Settings.jsx
 * Страница настроек платформы.
 * Сохраняет параметры в localStorage (так как в БД нет таблицы settings).
 */
import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon, Sliders, Bell, Globe, Palette, Save, RotateCcw, Check,
  Smartphone, Volume2, Zap, Monitor
} from 'lucide-react';

const DEFAULT_SETTINGS = {
  language: 'ru', currency: 'USD', timezone: 'UTC+3',
  oneClickTrading: true, soundEnabled: true,
  defaultAmount: 100, defaultExpiration: '1m',
  chartGrid: true, autoScrollChart: true,
  notifyTradeWin: true, notifyTradeLoss: true, notifyPush: true, notifyPromotions: false,
  theme: 'dark', compactView: false,
};

export default function Settings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState('trading');
  const [isSaved, setIsSaved] = useState(false);

  // Загрузка настроек из localStorage при монтировании
  useEffect(() => {
    document.title = 'Настройки | NovaTrade';
    const saved = localStorage.getItem('nova_settings');
    if (saved) {
      try { setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) }); } catch(e) {}
    }
  }, []);

  const handleToggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  const handleChange = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    localStorage.setItem('nova_settings', JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Сбросить все настройки?')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem('nova_settings');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Шапка */}
        <div className="settings-header">
          <div className="header-left">
            <div className="header-icon"><SettingsIcon size={24} color="#3B82F6" /></div>
            <div><h1 className="page-title">Настройки системы</h1><p className="page-subtitle">Персонализация торговой платформы</p></div>
          </div>
          <div className="header-actions">
            <button onClick={handleReset} className="btn-secondary"><RotateCcw size={16} /> Сброс</button>
            <button onClick={handleSave} className="btn-primary">
              {isSaved ? <Check size={16} /> : <Save size={16} />}
              <span>{isSaved ? 'Сохранено!' : 'Сохранить'}</span>
            </button>
          </div>
        </div>

        {/* Вкладки */}
        <div className="tabs-nav">
          {[
            { id: 'trading', label: 'Торговля и График', icon: Sliders },
            { id: 'general', label: 'Общие', icon: Globe },
            { id: 'notifications', label: 'Уведомления', icon: Bell },
            { id: 'appearance', label: 'Внешний вид', icon: Palette },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}>
                <Icon size={16} /> <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Контент */}
        <div className="content-box">
          {/* Торговля */}
          {activeTab === 'trading' && (
            <div className="section">
              <h2 className="section-title">Торговые параметры</h2>
              <div className="setting-row">
                <div><div className="setting-label">Торговля в один клик</div><div className="setting-desc">Открытие сделки без подтверждения</div></div>
                <button onClick={() => handleToggle('oneClickTrading')} className={`toggle-switch ${settings.oneClickTrading ? 'active' : ''}`}><div className="toggle-circle" /></button>
              </div>
              <div className="setting-row">
                <div><div className="setting-label">Звуковые эффекты</div><div className="setting-desc">Звук при открытии/закрытии сделок</div></div>
                <button onClick={() => handleToggle('soundEnabled')} className={`toggle-switch ${settings.soundEnabled ? 'active success' : ''}`}><div className="toggle-circle" /></button>
              </div>
              <div className="setting-row">
                <div><div className="setting-label">Сумма сделки по умолчанию</div><div className="setting-desc">Значение при загрузке терминала</div></div>
                <div className="input-wrapper small"><span className="currency-sign">$</span><input type="number" value={settings.defaultAmount} onChange={(e) => handleChange('defaultAmount', Number(e.target.value))} className="number-input" /></div>
              </div>
              <div className="setting-row">
                <div><div className="setting-label">Время экспирации</div><div className="setting-desc">Стандартное время сделки</div></div>
                <select value={settings.defaultExpiration} onChange={(e) => handleChange('defaultExpiration', e.target.value)} className="select-input">
                  <option value="5s">5 секунд</option><option value="1m">1 минута</option><option value="5m">5 минут</option>
                </select>
              </div>
            </div>
          )}

          {/* Общие */}
          {activeTab === 'general' && (
            <div className="section">
              <h2 className="section-title">Региональные настройки</h2>
              <div className="setting-row">
                <div><div className="setting-label">Язык интерфейса</div><div className="setting-desc">Предпочтительный язык</div></div>
                <select value={settings.language} onChange={(e) => handleChange('language', e.target.value)} className="select-input">
                  <option value="ru">Русский</option><option value="en">English</option>
                </select>
              </div>
              <div className="setting-row">
                <div><div className="setting-label">Основная валюта</div><div className="setting-desc">Валюта баланса</div></div>
                <select value={settings.currency} onChange={(e) => handleChange('currency', e.target.value)} className="select-input">
                  <option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="RUB">RUB (₽)</option>
                </select>
              </div>
            </div>
          )}

          {/* Уведомления */}
          {activeTab === 'notifications' && (
            <div className="section">
              <h2 className="section-title">Настройки оповещений</h2>
              <div className="setting-row">
                <div><div className="setting-label">Уведомления о выигрышах</div><div className="setting-desc">Всплывающие сообщения</div></div>
                <button onClick={() => handleToggle('notifyTradeWin')} className={`toggle-switch ${settings.notifyTradeWin ? 'active success' : ''}`}><div className="toggle-circle" /></button>
              </div>
              <div className="setting-row">
                <div><div className="setting-label">Push-уведомления браузера</div><div className="setting-desc">Системные уведомления</div></div>
                <button onClick={() => handleToggle('notifyPush')} className={`toggle-switch ${settings.notifyPush ? 'active' : ''}`}><div className="toggle-circle" /></button>
              </div>
            </div>
          )}

          {/* Внешний вид */}
          {activeTab === 'appearance' && (
            <div className="section">
              <h2 className="section-title">Персонализация стиля</h2>
              <div className="setting-row">
                <div><div className="setting-label">Тема оформления</div><div className="setting-desc">Цветовая схема</div></div>
                <select value={settings.theme} onChange={(e) => handleChange('theme', e.target.value)} className="select-input">
                  <option value="dark">Тёмная (Dark Slate)</option><option value="black">Абсолютный чёрный (OLED)</option>
                </select>
              </div>
              <div className="setting-row">
                <div><div className="setting-label">Сетка на графике</div><div className="setting-desc">Фоновые линии</div></div>
                <button onClick={() => handleToggle('chartGrid')} className={`toggle-switch ${settings.chartGrid ? 'active' : ''}`}><div className="toggle-circle" /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
