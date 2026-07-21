
import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Bell,
  Globe,
  Palette,
  Volume2,
  VolumeX,
  Zap,
  Save,
  RotateCcw,
  Check,
  Monitor,
  DollarSign,
  Clock,
  ShieldAlert
} from 'lucide-react';

// Дефолтные настройки
const DEFAULT_SETTINGS = {
  language: 'ru',
  currency: 'USD',
  timezone: 'UTC+3',
  oneClickTrading: true,
  soundEnabled: true,
  defaultAmount: 100,
  defaultExpiration: '1m',
  chartGrid: true,
  autoScrollChart: true,
  notifyTradeWin: true,
  notifyTradeLoss: true,
  notifyPush: true,
  notifyPromotions: false,
  theme: 'dark',
  compactView: false,
};

export default function Settings({
  currentSettings = DEFAULT_SETTINGS,
  onSaveSettings
}) {
  const [settings, setSettings] = useState(currentSettings);
  const [activeTab, setActiveTab] = useState('trading'); // 'trading' | 'general' | 'notifications' | 'appearance'
  const [isSaved, setIsSaved] = useState(false);

  // Хэндлеры изменения
  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (onSaveSettings) {
      onSaveSettings(settings);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Сбросить все настройки к значениям по умолчанию?')) {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  return (
    <div style={styles.container}>
      {/* Шапка настроек */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={styles.headerIconWrapper}>
            <SettingsIcon size={24} color="#3B82F6" />
          </div>
          <div>
            <h1 style={styles.title}>Настройки системы</h1>
            <p style={styles.subtitle}>Персонализация торговой платформы и интерфейса</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleReset} style={styles.resetBtn} title="Сбросить по умолчанию">
            <RotateCcw size={16} />
            <span>Сброс</span>
          </button>
          <button onClick={handleSave} style={styles.saveBtn}>
            {isSaved ? <Check size={16} /> : <Save size={16} />}
            <span>{isSaved ? 'Сохранено!' : 'Сохранить'}</span>
          </button>
        </div>
      </div>

      {/* Навигация по вкладкам */}
      <div style={styles.tabsNav}>
        {[
          { id: 'trading', label: 'Торговля и График', icon: Sliders },
          { id: 'general', label: 'Общие', icon: Globe },
          { id: 'notifications', label: 'Уведомления', icon: Bell },
          { id: 'appearance', label: 'Внешний вид', icon: Palette },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tabBtn,
                ...(isActive ? styles.tabBtnActive : {}),
              }}
            >
              <Icon size={16} color={isActive ? '#3B82F6' : '#94A3B8'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Содержимое вкладок */}
      <div style={styles.contentBox}>
        {/* Вкладка 1: Торговля и График */}
        {activeTab === 'trading' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Торговые параметры</h2>

            {/* Переключатель: Торговля в один клик */}
            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Торговля в один клик</div>
                <div style={styles.settingDesc}>Открытие сделки мгновенно без дополнительного подтверждения</div>
              </div>
              <button
                onClick={() => handleToggle('oneClickTrading')}
                style={{
                  ...styles.toggleSwitch,
                  backgroundColor: settings.oneClickTrading ? '#3B82F6' : '#334155',
                }}
              >
                <div
                  style={{
                    ...styles.toggleCircle,
                    transform: settings.oneClickTrading ? 'translateX(20px)' : 'translateX(0px)',
                  }}
                />
              </button>
            </div>

            {/* Переключатель: Звуки торговых событий */}
            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Звуковые эффекты</div>
                <div style={styles.settingDesc}>Звуковое сопровождение открытых и закрытых сделок</div>
              </div>
              <button
                onClick={() => handleToggle('soundEnabled')}
                style={{
                  ...styles.toggleSwitch,
                  backgroundColor: settings.soundEnabled ? '#10B981' : '#334155',
                }}
              >
                <div
                  style={{
                    ...styles.toggleCircle,
                    transform: settings.soundEnabled ? 'translateX(20px)' : 'translateX(0px)',
                  }}
                />
              </button>
            </div>

            {/* Поле: Инвестиция по умолчанию */}
            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Сумма сделки по умолчанию</div>
                <div style={styles.settingDesc}>Значение, подставляемое при загрузке платформы</div>
              </div>
              <div style={styles.inputWrapper}>
                <span style={{ color: '#64748B', fontWeight: '700' }}>$</span>
                <input
                  type="number"
                  value={settings.defaultAmount}
                  onChange={(e) => handleChange('defaultAmount', Number(e.target.value))}
                  style={styles.numberInput}
                />
              </div>
            </div>

            {/* Селект: Экспирация по умолчанию */}
            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Время экспирации по умолчанию</div>
                <div style={styles.settingDesc}>Стандартное время длительности сделки</div>
              </div>
              <select
                value={settings.defaultExpiration}
                onChange={(e) => handleChange('defaultExpiration', e.target.value)}
                style={styles.selectInput}
              >
                <option value="5s">5 секунд</option>
                <option value="1m">1 минута</option>
                <option value="5m">5 минут</option>
                <option value="15m">15 минут</option>
              </select>
            </div>
          </div>
        )}

        {/* Вкладка 2: Общие настройки */}
        {activeTab === 'general' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Региональные настройки</h2>

            {/* Язык */}
            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Язык интерфейса</div>
                <div style={styles.settingDesc}>Выберите предпочтительный язык</div>
              </div>
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                style={styles.selectInput}
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            {/* Валюта отображения */}
            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Основная валюта</div>
                <div style={styles.settingDesc}>Валюта для расчета баланса и отчетов</div>
              </div>
              <select
                value={settings.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                style={styles.selectInput}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="RUB">RUB (₽)</option>
                <option value="BTC">BTC (₿)</option>
              </select>
            </div>

            {/* Часовой пояс */}
            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Часовой пояс</div>
                <div style={styles.settingDesc}>Отображение времени на графике и в истории</div>
              </div>
              <select
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                style={styles.selectInput}
              >
                <option value="UTC+0">UTC +00:00 (Лондон)</option>
                <option value="UTC+3">UTC +03:00 (Москва / Стамбул)</option>
                <option value="UTC+5">UTC +05:00 (Екатеринбург)</option>
                <option value="UTC-5">UTC -05:00 (Нью-Йорк)</option>
              </select>
            </div>
          </div>
        )}

        {/* Вкладка 3: Уведомления */}
        {activeTab === 'notifications' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Настройки оповещений</h2>

            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Уведомления о выигрышных сделках</div>
                <div style={styles.settingDesc}>Всплывающие сообщения при закрытии сделки в плюс</div>
              </div>
              <button
                onClick={() => handleToggle('notifyTradeWin')}
                style={{
                  ...styles.toggleSwitch,
                  backgroundColor: settings.notifyTradeWin ? '#10B981' : '#334155',
                }}
              >
                <div
                  style={{
                    ...styles.toggleCircle,
                    transform: settings.notifyTradeWin ? 'translateX(20px)' : 'translateX(0px)',
                  }}
                />
              </button>
            </div>

            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Уведомления об убыточных сделках</div>
                <div style={styles.settingDesc}>Всплывающие сообщения при закрытии сделки в минус</div>
              </div>
              <button
                onClick={() => handleToggle('notifyTradeLoss')}
                style={{
                  ...styles.toggleSwitch,
                  backgroundColor: settings.notifyTradeLoss ? '#EF4444' : '#334155',
                }}
              >
                <div
                  style={{
                    ...styles.toggleCircle,
                    transform: settings.notifyTradeLoss ? 'translateX(20px)' : 'translateX(0px)',
                  }}
                />
              </button>
            </div>

            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Push-уведомления браузера</div>
                <div style={styles.settingDesc}>Получать системные уведомления вне платформы</div>
              </div>
              <button
                onClick={() => handleToggle('notifyPush')}
                style={{
                  ...styles.toggleSwitch,
                  backgroundColor: settings.notifyPush ? '#3B82F6' : '#334155',
                }}
              >
                <div
                  style={{
                    ...styles.toggleCircle,
                    transform: settings.notifyPush ? 'translateX(20px)' : 'translateX(0px)',
                  }}
                />
              </button>
            </div>

            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Маркетинг и рассылки</div>
                <div style={styles.settingDesc}>Получать информацию об акциях, бонусах и новостях</div>
              </div>
              <button
                onClick={() => handleToggle('notifyPromotions')}
                style={{
                  ...styles.toggleSwitch,
                  backgroundColor: settings.notifyPromotions ? '#3B82F6' : '#334155',
                }}
              >
                <div
                  style={{
                    ...styles.toggleCircle,
                    transform: settings.notifyPromotions ? 'translateX(20px)' : 'translateX(0px)',
                  }}
                />
              </button>
            </div>
          </div>
        )}

        {/* Вкладка 4: Внешний вид */}
        {activeTab === 'appearance' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Персонализация стиля</h2>

            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Тема оформления</div>
                <div style={styles.settingDesc}>Цветовая схема рабочего пространства</div>
              </div>
              <select
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                style={styles.selectInput}
              >
                <option value="dark">Тёмная (Dark Slate)</option>
                <option value="midnight">Полночь (Cyber Navy)</option>
                <option value="black">Абсолютный чёрный (OLED)</option>
              </select>
            </div>

            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Сетка на графике</div>
                <div style={styles.settingDesc}>Отображать фоновые горизонтальные и вертикальные линии</div>
              </div>
              <button
                onClick={() => handleToggle('chartGrid')}
                style={{
                  ...styles.toggleSwitch,
                  backgroundColor: settings.chartGrid ? '#3B82F6' : '#334155',
                }}
              >
                <div
                  style={{
                    ...styles.toggleCircle,
                    transform: settings.chartGrid ? 'translateX(20px)' : 'translateX(0px)',
                  }}
                />
              </button>
            </div>

            <div style={styles.settingRow}>
              <div>
                <div style={styles.settingLabel}>Автоскролл графика</div>
                <div style={styles.settingDesc}>Автоматически следовать за новыми котировками</div>
              </div>
              <button
                onClick={() => handleToggle('autoScrollChart')}
                style={{
                  ...styles.toggleSwitch,
                  backgroundColor: settings.autoScrollChart ? '#3B82F6' : '#334155',
                }}
              >
                <div
                  style={{
                    ...styles.toggleCircle,
                    transform: settings.autoScrollChart ? 'translateX(20px)' : 'translateX(0px)',
                  }}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Стили
const styles = {
  container: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '24px',
    color: '#F8FAFC',
    maxWidth: '850px',
    margin: '0 auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerIconWrapper: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    padding: '10px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '20px',
    fontWeight: '800',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: '#94A3B8',
    margin: '2px 0 0 0',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#94A3B8',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#3B82F6',
    border: 'none',
    borderRadius: '8px',
    color: '#FFFFFF',
    padding: '8px 18px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },
  tabsNav: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid #334155',
    paddingBottom: '8px',
    overflowX: 'auto',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#94A3B8',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    border: '1px solid #334155',
  },
  contentBox: {
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '20px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '700',
    margin: '0 0 4px 0',
    color: '#F8FAFC',
  },
  settingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
    gap: '16px',
  },
  settingLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#F8FAFC',
  },
  settingDesc: {
    fontSize: '12px',
    color: '#64748B',
    marginTop: '2px',
  },
  toggleSwitch: {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    border: 'none',
    padding: '2px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
  },
  toggleCircle: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    transition: 'transform 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '6px 12px',
  },
  numberInput: {
    width: '70px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#F8FAFC',
    fontSize: '14px',
    fontWeight: '700',
    outline: 'none',
  },
  selectInput: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#F8FAFC',
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: '600',
    outline: 'none',
    cursor: 'pointer',
  },
};
