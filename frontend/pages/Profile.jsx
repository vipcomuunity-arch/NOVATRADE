import React, { useState } from 'react';
import Head from 'next/head';
import {
  User,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  Globe,
  Award,
  Lock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Camera,
  Smartphone,
  LogOut,
  History,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Upload
} from 'lucide-react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'security' | 'verification' | 'history'
  const [copiedId, setCopiedId] = useState(false);
  const [is2FA, setIs2FA] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Состояние пользовательских данных
  const [user, setUser] = useState({
    name: 'Александр Трейдеров',
    email: 'trader@novatrade.io',
    phone: '+7 (999) 123-45-67',
    country: 'Россия',
    city: 'Москва',
    userId: 'NV-884920',
    verificationLevel: 2, // 1: Базовая, 2: Полная
    memberSince: '12 Января 2025',
    rank: 'PRO Trader',
    totalTrades: 342,
    winRate: 64.5,
    totalProfit: 12450.00
  });

  // Форма смены пароля
  const [passForm, setPassForm] = useState({
    currentPass: '',
    newPass: '',
    confirmPass: ''
  });

  // История транзакций/сделок
  const [history] = useState([
    { id: '1', type: 'DEPOSIT', amount: 500, asset: 'USDT (TRC20)', status: 'COMPLETED', date: '2026-07-20 14:32' },
    { id: '2', type: 'TRADE_WIN', amount: 185, asset: 'BTC/USD', status: 'COMPLETED', date: '2026-07-19 18:10' },
    { id: '3', type: 'WITHDRAW', amount: 300, asset: 'Bank Card', status: 'COMPLETED', date: '2026-07-15 09:45' },
    { id: '4', type: 'TRADE_LOSS', amount: 100, asset: 'ETH/USD', status: 'COMPLETED', date: '2026-07-14 21:05' }
  ]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.userId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <>
      <Head>
        <title>Профиль пользователя | NovaTrade</title>
        <meta name="description" content="Управление профилем, безопасностью и верификацией" />
      </Head>

      <div style={styles.pageWrapper}>
        <div style={styles.container}>
          {/* Шапка профиля */}
          <div style={styles.profileHeader}>
            <div style={styles.avatarContainer}>
              <div style={styles.avatar}>
                <User size={48} color="#94A3B8" />
              </div>
              <button style={styles.avatarEditBtn} title="Изменить фото профиля">
                <Camera size={14} color="#FFF" />
              </button>
            </div>

            <div style={styles.userMainInfo}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={styles.userName}>{user.name}</h1>
                <span style={styles.rankBadge}>
                  <Award size={14} color="#F59E0B" />
                  {user.rank}
                </span>
              </div>

              <div style={styles.userSubInfo}>
                <span>ID: {user.userId}</span>
                <button onClick={handleCopyId} style={styles.copyBtn} title="Копировать ID">
                  {copiedId ? <Check size={12} color="#10B981" /> : <Copy size={12} color="#64748B" />}
                </button>
                <span style={styles.dotSeparator}>•</span>
                <span>На платформе с {user.memberSince}</span>
              </div>
            </div>

            {/* Статус верификации */}
            <div style={styles.verificationBadgeCard}>
              {user.verificationLevel === 2 ? (
                <>
                  <ShieldCheck size={26} color="#10B981" />
                  <div>
                    <div style={styles.verifTitle}>Аккаунт верифицирован</div>
                    <div style={styles.verifSub}>Доступны все способы вывода</div>
                  </div>
                </>
              ) : (
                <>
                  <ShieldAlert size={26} color="#F59E0B" />
                  <div>
                    <div style={{ ...styles.verifTitle, color: '#F59E0B' }}>Базовый уровень</div>
                    <div style={styles.verifSub}>Пройдите KYC для снятия лимитов</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Карточки торговой статистики */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Всего сделок</span>
              <span style={styles.statValue}>{user.totalTrades}</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Процент побед (Win Rate)</span>
              <span style={{ ...styles.statValue, color: '#10B981' }}>{user.winRate}%</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Общий профит</span>
              <span style={{ ...styles.statValue, color: '#3B82F6' }}>
                +${user.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Навигация по вкладкам */}
          <div style={styles.tabsNav}>
            {[
              { id: 'general', label: 'Личные данные', icon: User },
              { id: 'security', label: 'Безопасность', icon: Lock },
              { id: 'verification', label: 'Верификация (KYC)', icon: ShieldCheck },
              { id: 'history', label: 'История операций', icon: History }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    ...styles.tabBtn,
                    ...(isActive ? styles.tabBtnActive : {})
                  }}
                >
                  <Icon size={16} color={isActive ? '#3B82F6' : '#94A3B8'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Основной контент вкладок */}
          <div style={styles.contentCard}>
            {/* Вкладка 1: Личные данные */}
            {activeTab === 'general' && (
              <form onSubmit={handleSaveProfile} style={styles.sectionContainer}>
                <h2 style={styles.sectionTitle}>Персональная информация</h2>
                
                {saveSuccess && (
                  <div style={styles.alertSuccess}>
                    <CheckCircle2 size={16} color="#10B981" />
                    <span>Изменения успешно сохранены!</span>
                  </div>
                )}

                <div style={styles.formGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>ФИО</label>
                    <div style={styles.inputWrapper}>
                      <User size={16} color="#64748B" style={styles.inputIcon} />
                      <input
                        type="text"
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Электронная почта</label>
                    <div style={styles.inputWrapper}>
                      <Mail size={16} color="#64748B" style={styles.inputIcon} />
                      <input type="email" value={user.email} style={styles.input} disabled />
                      <CheckCircle2 size={16} color="#10B981" style={styles.verifiedIcon} title="Подтверждено" />
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Номер телефона</label>
                    <div style={styles.inputWrapper}>
                      <Phone size={16} color="#64748B" style={styles.inputIcon} />
                      <input
                        type="text"
                        value={user.phone}
                        onChange={(e) => setUser({ ...user, phone: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Страна</label>
                    <div style={styles.inputWrapper}>
                      <Globe size={16} color="#64748B" style={styles.inputIcon} />
                      <input
                        type="text"
                        value={user.country}
                        onChange={(e) => setUser({ ...user, country: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="submit" style={styles.saveBtn}>Сохранить изменения</button>
                </div>
              </form>
            )}

            {/* Вкладка 2: Безопасность */}
            {activeTab === 'security' && (
              <div style={styles.sectionContainer}>
                <h2 style={styles.sectionTitle}>Настройки безопасности</h2>

                {/* 2FA */}
                <div style={styles.securityBox}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={styles.iconBox}>
                      <Smartphone size={22} color="#3B82F6" />
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '15px' }}>Двухфакторная аутентификация (2FA)</div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                        Защита входа и вывода средств через одноразовые коды Google Authenticator
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIs2FA(!is2FA)}
                    style={{
                      ...styles.toggleBtn,
                      backgroundColor: is2FA ? '#10B981' : '#334155'
                    }}
                  >
                    {is2FA ? 'Включено' : 'Выключено'}
                  </button>
                </div>

                <div style={{ borderTop: '1px solid #334155', margin: '20px 0' }} />

                {/* Форма смены пароля */}
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>Смена пароля</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '420px' }}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Текущий пароль</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passForm.currentPass}
                      onChange={(e) => setPassForm({ ...passForm, currentPass: e.target.value })}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Новый пароль</label>
                    <input
                      type="password"
                      placeholder="Минимум 8 символов"
                      value={passForm.newPass}
                      onChange={(e) => setPassForm({ ...passForm, newPass: e.target.value })}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Подтвердите новый пароль</label>
                    <input
                      type="password"
                      placeholder="Повторите пароль"
                      value={passForm.confirmPass}
                      onChange={(e) => setPassForm({ ...passForm, confirmPass: e.target.value })}
                      style={styles.input}
                    />
                  </div>

                  <button style={{ ...styles.saveBtn, marginTop: '8px' }}>Обновить пароль</button>
                </div>
              </div>
            )}

            {/* Вкладка 3: Верификация */}
            {activeTab === 'verification' && (
              <div style={styles.sectionContainer}>
                <h2 style={styles.sectionTitle}>Статус проверки личности (KYC)</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={styles.kycRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <CheckCircle2 size={20} color="#10B981" />
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>1. Подтверждение Email</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>{user.email}</div>
                      </div>
                    </div>
                    <span style={styles.statusDone}>Подтверждено</span>
                  </div>

                  <div style={styles.kycRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <CheckCircle2 size={20} color="#10B981" />
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>2. Паспортные данные</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>Удостоверение личности загружено</div>
                      </div>
                    </div>
                    <span style={styles.statusDone}>Проверено</span>
                  </div>

                  <div style={styles.kycRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <AlertCircle size={20} color="#F59E0B" />
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>3. Адрес проживания</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>Выписка из банка или счёт за КУ</div>
                      </div>
                    </div>
                    <button style={styles.uploadBtn}>
                      <Upload size={14} />
                      Загрузить
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Вкладка 4: История операций */}
            {activeTab === 'history' && (
              <div style={styles.sectionContainer}>
                <h2 style={styles.sectionTitle}>История транзакций и операций</h2>

                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.th}>Тип</th>
                        <th style={styles.th}>Актив / Метод</th>
                        <th style={styles.th}>Сумма</th>
                        <th style={styles.th}>Дата</th>
                        <th style={styles.th}>Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
                        <tr key={item.id} style={styles.tableRow}>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {item.type.includes('WIN') || item.type === 'DEPOSIT' ? (
                                <ArrowUpRight size={16} color="#10B981" />
                              ) : (
                                <ArrowDownRight size={16} color="#EF4444" />
                              )}
                              <span style={{ fontWeight: '600' }}>{item.type}</span>
                            </div>
                          </td>
                          <td style={styles.td}>{item.asset}</td>
                          <td style={{
                            ...styles.td,
                            fontWeight: '700',
                            color: item.type.includes('WIN') || item.type === 'DEPOSIT' ? '#10B981' : '#EF4444'
                          }}>
                            {item.type.includes('WIN') || item.type === 'DEPOSIT' ? '+' : '-'}${item.amount}
                          </td>
                          <td style={{ ...styles.td, color: '#64748B' }}>{item.date}</td>
                          <td style={styles.td}>
                            <span style={styles.statusBadge}>{item.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Стили
const styles = {
  pageWrapper: {
    backgroundColor: '#0F172A',
    minHeight: '100vh',
    padding: '30px 16px',
    boxSizing: 'border-box',
    color: '#F8FAFC',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  container: {
    maxWidth: '960px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    backgroundColor: '#1E293B',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid #334155',
    flexWrap: 'wrap'
  },
  avatarContainer: {
    position: 'relative'
  },
  avatar: {
    width: '76px',
    height: '76px',
    borderRadius: '50%',
    backgroundColor: '#0F172A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #3B82F6'
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#3B82F6',
    border: 'none',
    borderRadius: '50%',
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  userMainInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  userName: {
    fontSize: '22px',
    fontWeight: '800',
    margin: 0
  },
  rankBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#F59E0B',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700'
  },
  userSubInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#94A3B8'
  },
  copyBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center'
  },
  dotSeparator: {
    color: '#334155'
  },
  verificationBadgeCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#0F172A',
    padding: '12px 18px',
    borderRadius: '12px',
    border: '1px solid #334155'
  },
  verifTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#10B981'
  },
  verifSub: {
    fontSize: '11px',
    color: '#64748B'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px'
  },
  statCard: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statLabel: {
    fontSize: '11px',
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  statValue: {
    fontSize: '22px',
    fontWeight: '800'
  },
  tabsNav: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid #334155',
    paddingBottom: '8px',
    overflowX: 'auto'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#94A3B8',
    padding: '10px 18px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease'
  },
  tabBtnActive: {
    backgroundColor: '#1E293B',
    color: '#F8FAFC',
    border: '1px solid #334155'
  },
  contentCard: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '24px'
  },
  sectionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '800',
    margin: 0
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid #10B981',
    color: '#10B981',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#94A3B8'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none'
  },
  verifiedIcon: {
    position: 'absolute',
    right: '12px'
  },
  input: {
    width: '100%',
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 12px 10px 38px',
    color: '#F8FAFC',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  saveBtn: {
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  },
  securityBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    gap: '16px',
    flexWrap: 'wrap'
  },
  iconBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    padding: '10px',
    borderRadius: '10px'
  },
  toggleBtn: {
    border: 'none',
    borderRadius: '20px',
    padding: '8px 18px',
    color: '#FFF',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer'
  },
  kycRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: '14px 18px',
    borderRadius: '10px',
    border: '1px solid #334155',
    flexWrap: 'wrap',
    gap: '12px'
  },
  statusDone: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: '12px'
  },
  uploadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#3B82F6',
    color: '#FFF',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 14px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '13px'
  },
  tableHeaderRow: {
    borderBottom: '1px solid #334155'
  },
  th: {
    padding: '10px 12px',
    color: '#64748B',
    fontWeight: '700',
    fontSize: '11px',
    textTransform: 'uppercase'
  },
  tableRow: {
    borderBottom: '1px solid rgba(51, 65, 85, 0.5)'
  },
  td: {
    padding: '12px'
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#10B981',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px'
  }
};
