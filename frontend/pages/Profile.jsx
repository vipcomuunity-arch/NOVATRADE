/**
 * frontend/pages/Profile.jsx
 * Страница профиля пользователя: личные данные, безопасность, KYC и история.
 * Интегрирована с реальным REST API (api.profile).
 */
import React, { useState, useEffect } from 'react';
import {
  User, ShieldCheck, ShieldAlert, Mail, Phone, Globe, Award, Lock,
  CheckCircle2, AlertCircle, Copy, Check, Camera, Smartphone,
  History, ArrowUpRight, ArrowDownRight, Upload, Loader2
} from 'lucide-react';
import api from '../services/api';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('general');
  const [copiedId, setCopiedId] = useState(false);
  const [is2FA, setIs2FA] = useState(true); // Mock state
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояние пользовательских данных
  const [user, setUser] = useState({
    name: '', email: '', phone: '', country: '',
    userId: '', verificationLevel: 1, memberSince: '',
    rank: 'PRO Trader'
  });

  // Состояние статистики
  const [stats, setStats] = useState({
    totalTrades: 0, winRate: '0%', netProfit: 0
  });

  // Форма смены пароля
  const [passForm, setPassForm] = useState({ currentPass: '', newPass: '', confirmPass: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  // История (пока mock, так как в API нет отдельного эндпоинта для финансовых транзакций)
  const [history] = useState([
    { id: '1', type: 'DEPOSIT', amount: 500, asset: 'USDT (TRC20)', status: 'COMPLETED', date: '2026-07-20 14:32' },
    { id: '2', type: 'TRADE_WIN', amount: 185, asset: 'BTC/USD', status: 'COMPLETED', date: '2026-07-19 18:10' },
  ]);

  // ==========================================
  // 1. ЗАГРУЗКА ДАННЫХ С БЭКА
  // ==========================================
  useEffect(() => {
    document.title = 'Профиль | NovaTrade';
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, statsRes] = await Promise.all([
          api.profile.getProfile(),
          api.profile.getStats()
        ]);
        
        const p = profileRes.user;
        setUser({
          name: p.name,
          email: p.email,
          phone: p.phone || '',
          country: p.country || '',
          userId: p.id.substring(0, 8).toUpperCase(),
          verificationLevel: p.is_verified ? 2 : 1,
          memberSince: new Date(p.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
        });

        setStats({
          totalTrades: statsRes.stats.totalTrades,
          winRate: statsRes.stats.winRate,
          netProfit: statsRes.stats.netProfit
        });
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('Не удалось загрузить профиль');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ==========================================
  // 2. ОБРАБОТЧИКИ ФОРМ
  // ==========================================
  const handleCopyId = () => {
    navigator.clipboard.writeText(user.userId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.profile.updateProfile({ name: user.name, avatar: user.avatar });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError(''); setPassSuccess(false);
    if (passForm.newPass !== passForm.confirmPass) {
      setPassError('Новые пароли не совпадают'); return;
    }
    try {
      await api.profile.changePassword({ currentPassword: passForm.currentPass, newPassword: passForm.newPass });
      setPassSuccess(true);
      setPassForm({ currentPass: '', newPass: '', confirmPass: '' });
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (err) {
      setPassError(err.response?.data?.message || 'Ошибка смены пароля');
    }
  };

  if (loading) return <div className="page-loading"><Loader2 className="animate-spin" size={24} /> Загрузка профиля...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Шапка профиля */}
        <div className="profile-header">
          <div className="avatar-container">
            <div className="avatar">
              <User size={48} color="#94A3B8" />
            </div>
            <button className="avatar-edit-btn" title="Изменить фото">
              <Camera size={14} color="#FFF" />
            </button>
          </div>
          
          <div className="user-main-info">
            <div className="user-name-row">
              <h1 className="user-name">{user.name}</h1>
              <span className="rank-badge"><Award size={14} color="#F59E0B" /> {user.rank}</span>
            </div>
            <div className="user-sub-info">
              <span>ID: {user.userId}</span>
              <button onClick={handleCopyId} className="copy-btn">
                {copiedId ? <Check size={12} color="#10B981" /> : <Copy size={12} color="#64748B" />}
              </button>
              <span className="dot-sep">•</span>
              <span>На платформе с {user.memberSince}</span>
            </div>
          </div>

          <div className="verification-badge">
            {user.verificationLevel === 2 ? (
              <><ShieldCheck size={26} color="#10B981" /><div><div className="verif-title success">Аккаунт верифицирован</div><div className="verif-sub">Доступны все способы вывода</div></div></>
            ) : (
              <><ShieldAlert size={26} color="#F59E0B" /><div><div className="verif-title warning">Базовый уровень</div><div className="verif-sub">Пройдите KYC для снятия лимитов</div></div></>
            )}
          </div>
        </div>

        {/* Карточки статистики */}
        <div className="stats-grid">
          <div className="stat-card"><span className="stat-label">Всего сделок</span><span className="stat-value">{stats.totalTrades}</span></div>
          <div className="stat-card"><span className="stat-label">Процент побед</span><span className="stat-value text-success">{stats.winRate}</span></div>
          <div className="stat-card"><span className="stat-label">Общий профит</span><span className="stat-value text-primary">+${stats.netProfit.toFixed(2)}</span></div>
        </div>

        {/* Навигация по вкладкам */}
        <div className="tabs-nav">
          {[
            { id: 'general', label: 'Личные данные', icon: User },
            { id: 'security', label: 'Безопасность', icon: Lock },
            { id: 'verification', label: 'Верификация (KYC)', icon: ShieldCheck },
            { id: 'history', label: 'История операций', icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}>
                <Icon size={16} /> <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Контент вкладок */}
        <div className="content-card">
          {/* Вкладка: Личные данные */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveProfile} className="section-container">
              <h2 className="section-title">Персональная информация</h2>
              {saveSuccess && <div className="alert success"><CheckCircle2 size={16} /> Изменения успешно сохранены!</div>}
              <div className="form-grid">
                <div className="input-group">
                  <label>ФИО</label>
                  <div className="input-wrapper"><User size={16} className="input-icon" /><input type="text" value={user.name} onChange={(e) => setUser({...user, name: e.target.value})} className="form-input" /></div>
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <div className="input-wrapper"><Mail size={16} className="input-icon" /><input type="email" value={user.email} disabled className="form-input disabled" /><CheckCircle2 size={16} className="verified-icon" /></div>
                </div>
                <div className="input-group">
                  <label>Телефон</label>
                  <div className="input-wrapper"><Phone size={16} className="input-icon" /><input type="text" value={user.phone} onChange={(e) => setUser({...user, phone: e.target.value})} className="form-input" /></div>
                </div>
                <div className="input-group">
                  <label>Страна</label>
                  <div className="input-wrapper"><Globe size={16} className="input-icon" /><input type="text" value={user.country} onChange={(e) => setUser({...user, country: e.target.value})} className="form-input" /></div>
                </div>
              </div>
              <button type="submit" className="btn-primary">Сохранить изменения</button>
            </form>
          )}

          {/* Вкладка: Безопасность */}
          {activeTab === 'security' && (
            <div className="section-container">
              <h2 className="section-title">Настройки безопасности</h2>
              <div className="security-box">
                <div className="security-info">
                  <div className="icon-box"><Smartphone size={22} color="#3B82F6" /></div>
                  <div><div className="setting-label">Двухфакторная аутентификация (2FA)</div><div className="setting-desc">Защита входа через Google Authenticator</div></div>
                </div>
                <button onClick={() => setIs2FA(!is2FA)} className={`toggle-btn ${is2FA ? 'active' : ''}`}>{is2FA ? 'Включено' : 'Выключено'}</button>
              </div>
              
              <h3 className="sub-title">Смена пароля</h3>
              {passError && <div className="alert error"><AlertCircle size={16} /> {passError}</div>}
              {passSuccess && <div className="alert success"><CheckCircle2 size={16} /> Пароль успешно изменен!</div>}
              <form onSubmit={handleChangePassword} className="password-form">
                <div className="input-group"><label>Текущий пароль</label><input type="password" value={passForm.currentPass} onChange={(e) => setPassForm({...passForm, currentPass: e.target.value})} className="form-input" placeholder="••••••••" /></div>
                <div className="input-group"><label>Новый пароль</label><input type="password" value={passForm.newPass} onChange={(e) => setPassForm({...passForm, newPass: e.target.value})} className="form-input" placeholder="Минимум 6 символов" /></div>
                <div className="input-group"><label>Подтвердите пароль</label><input type="password" value={passForm.confirmPass} onChange={(e) => setPassForm({...passForm, confirmPass: e.target.value})} className="form-input" placeholder="Повторите пароль" /></div>
                <button type="submit" className="btn-primary">Обновить пароль</button>
              </form>
            </div>
          )}

          {/* Вкладка: Верификация */}
          {activeTab === 'verification' && (
            <div className="section-container">
              <h2 className="section-title">Статус проверки личности (KYC)</h2>
              <div className="kyc-list">
                <div className="kyc-row"><div className="kyc-info"><CheckCircle2 size={20} color="#10B981" /><div><div className="kyc-title">1. Подтверждение Email</div><div className="kyc-sub">{user.email}</div></div></div><span className="status-done">Подтверждено</span></div>
                <div className="kyc-row"><div className="kyc-info"><AlertCircle size={20} color="#F59E0B" /><div><div className="kyc-title">2. Паспортные данные</div><div className="kyc-sub">Требуется загрузка документа</div></div></div><button className="btn-upload"><Upload size={14} /> Загрузить</button></div>
              </div>
            </div>
          )}

          {/* Вкладка: История */}
          {activeTab === 'history' && (
            <div className="section-container">
              <h2 className="section-title">История транзакций</h2>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Тип</th><th>Актив / Метод</th><th>Сумма</th><th>Дата</th><th>Статус</th></tr></thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id}>
                        <td><div className="table-type"><ArrowUpRight size={16} color={item.type.includes('WIN') || item.type === 'DEPOSIT' ? '#10B981' : '#EF4444'} /><span>{item.type}</span></div></td>
                        <td>{item.asset}</td>
                        <td className={item.type.includes('WIN') || item.type === 'DEPOSIT' ? 'text-success' : 'text-danger'}>{item.type.includes('WIN') || item.type === 'DEPOSIT' ? '+' : '-'}${item.amount}</td>
                        <td className="text-muted">{item.date}</td>
                        <td><span className="status-badge">{item.status}</span></td>
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
  );
}
