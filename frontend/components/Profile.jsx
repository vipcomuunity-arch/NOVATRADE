
import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';

export default function Profile({
  userData = {
    name: 'Александр Трейдеров',
    email: 'trader@novatrade.io',
    phone: '+7 (999) 123-45-67',
    country: 'Россия',
    userId: 'NV-884920',
    verificationLevel: 2, // 1: Базовая, 2: Полная
    is2FAEnabled: true,
    memberSince: '12 Янв 2025',
    totalTrades: 342,
    winRate: 64.5,
    rank: 'PRO Trader'
  }
}) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'security' | 'verification'
  const [copiedId, setCopiedId] = useState(false);
  const [is2FA, setIs2FA] = useState(userData.is2FAEnabled);

  // Форма изменения пароля
  const [passForm, setPassForm] = useState({
    currentPass: '',
    newPass: '',
    confirmPass: ''
  });

  const handleCopyId = () => {
    navigator.clipboard.writeText(userData.userId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div style={styles.container}>
      {/* Шапка профиля */}
      <div style={styles.profileHeader}>
        <div style={styles.avatarContainer}>
          <div style={styles.avatar}>
            <User size={48} color="#94A3B8" />
          </div>
          <button style={styles.avatarEditBtn} title="Изменить фото">
            <Camera size={14} color="#FFF" />
          </button>
        </div>

        <div style={styles.userMainInfo}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={styles.userName}>{userData.name}</h1>
            <span style={styles.rankBadge}>
              <Award size={14} color="#F59E0B" />
              {userData.rank}
            </span>
          </div>

          <div style={styles.userSubInfo}>
            <span>ID: {userData.userId}</span>
            <button onClick={handleCopyId} style={styles.copyBtn} title="Копировать ID">
              {copiedId ? <Check size={12} color="#10B981" /> : <Copy size={12} color="#64748B" />}
            </button>
            <span style={styles.dotSeparator}>•</span>
            <span>На платформе с {userData.memberSince}</span>
          </div>
        </div>

        {/* Статус верификации */}
        <div style={styles.verificationBadgeCard}>
          {userData.verificationLevel === 2 ? (
            <>
              <ShieldCheck size={24} color="#10B981" />
              <div>
                <div style={styles.verifTitle}>Аккаунт верифицирован</div>
                <div style={styles.verifSub}>Доступны все способы вывода</div>
              </div>
            </>
          ) : (
            <>
              <ShieldAlert size={24} color="#F59E0B" />
              <div>
                <div style={{ ...styles.verifTitle, color: '#F59E0B' }}>Требуется проверка</div>
                <div style={styles.verifSub}>Загрузите документы</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Быстрая торговая статистика */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Всего сделок</span>
          <span style={styles.statValue}>{userData.totalTrades}</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Средний Винрейт</span>
          <span style={{ ...styles.statValue, color: '#10B981' }}>{userData.winRate}%</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Дневной лимит вывода</span>
          <span style={styles.statValue}>$50,000</span>
        </div>
      </div>

      {/* Переключение вкладок */}
      <div style={styles.tabsNav}>
        {[
          { id: 'general', label: 'Личные данные', icon: User },
          { id: 'security', label: 'Безопасность', icon: Lock },
          { id: 'verification', label: 'Верификация (KYC)', icon: ShieldCheck }
        ].map(tab => {
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

      {/* Содержимое вкладок */}
      <div style={styles.contentCard}>
        {/* Вкладка 1: Личные данные */}
        {activeTab === 'general' && (
          <div style={styles.sectionContainer}>
            <h2 style={styles.sectionTitle}>Персональная информация</h2>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>ФИО</label>
                <div style={styles.inputWrapper}>
                  <User size={16} color="#64748B" style={styles.inputIcon} />
                  <input type="text" defaultValue={userData.name} style={styles.input} />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Электронная почта</label>
                <div style={styles.inputWrapper}>
                  <Mail size={16} color="#64748B" style={styles.inputIcon} />
                  <input type="email" defaultValue={userData.email} style={styles.input} disabled />
                  <CheckCircle2 size={16} color="#10B981" style={styles.verifiedIcon} />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Номер телефона</label>
                <div style={styles.inputWrapper}>
                  <Phone size={16} color="#64748B" style={styles.inputIcon} />
                  <input type="text" defaultValue={userData.phone} style={styles.input} />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Страна проживания</label>
                <div style={styles.inputWrapper}>
                  <Globe size={16} color="#64748B" style={styles.inputIcon} />
                  <input type="text" defaultValue={userData.country} style={styles.input} />
                </div>
              </div>
            </div>

            <button style={styles.saveBtn}>Сохранить изменения</button>
          </div>
        )}

        {/* Вкладка 2: Безопасность */}
        {activeTab === 'security' && (
          <div style={styles.sectionContainer}>
            <h2 style={styles.sectionTitle}>Защита аккаунта</h2>

            {/* Двухфакторка */}
            <div style={styles.securityBox}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={styles.iconBox}>
                  <Smartphone size={22} color="#3B82F6" />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px' }}>Двухфакторная аутентификация (2FA)</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    Защитите входы и вывод средств через Google Authenticator
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

            {/* Смена пароля */}
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>Смена пароля</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
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

              <button style={{ ...styles.saveBtn, marginTop: '8px' }}>Обновить пароль</button>
            </div>
          </div>
        )}

        {/* Вкладка 3: Верификация */}
        {activeTab === 'verification' && (
          <div style={styles.sectionContainer}>
            <h2 style={styles.sectionTitle}>Статус верификации (KYC)</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={styles.kycRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle2 size={20} color="#10B981" />
                  <div>
                    <div style={{ fontWeight: '600' }}>1. Подтверждение Email</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{userData.email}</div>
                  </div>
                </div>
                <span style={styles.statusDone}>Пройдено</span>
              </div>

              <div style={styles.kycRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle2 size={20} color="#10B981" />
                  <div>
                    <div style={{ fontWeight: '600' }}>2. Удостоверение личности</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Паспорт или Водительские права</div>
                  </div>
                </div>
                <span style={styles.statusDone}>Подтверждено</span>
              </div>

              <div style={styles.kycRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <AlertCircle size={20} color="#F59E0B" />
                  <div>
                    <div style={{ fontWeight: '600' }}>3. Подтверждение адреса</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Выписка из банка или счёт за КУ</div>
                  </div>
                </div>
                <button style={styles.uploadBtn}>Загрузить документ</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Стили компонента
const styles = {
  container: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '24px',
    color: '#F8FAFC',
    maxWidth: '900px',
    margin: '0 auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    backgroundColor: '#0F172A',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #334155',
    flexWrap: 'wrap'
  },
  avatarContainer: {
    position: 'relative'
  },
  avatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: '#334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #3B82F6'
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
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
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    color: '#F59E0B',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700'
  },
  userSubInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
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
    backgroundColor: '#1E293B',
    padding: '12px 16px',
    borderRadius: '10px',
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
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px'
  },
  statCard: {
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statLabel: {
    fontSize: '11px',
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '800'
  },
  tabsNav: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid #334155',
    paddingBottom: '8px'
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
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  tabBtnActive: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    border: '1px solid #334155'
  },
  contentCard: {
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '20px'
  },
  sectionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    margin: 0
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
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
    backgroundColor: '#1E293B',
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
    alignSelf: 'flex-start'
  },
  securityBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0'
  },
  iconBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: '10px',
    borderRadius: '10px'
  },
  toggleBtn: {
    border: 'none',
    borderRadius: '20px',
    padding: '8px 16px',
    color: '#FFF',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer'
  },
  kycRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #334155'
  },
  statusDone: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: '12px'
  },
  uploadBtn: {
    backgroundColor: '#3B82F6',
    color: '#FFF',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};
