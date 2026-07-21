
import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Состояние формы
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Простая валидация
    if (!formData.email || !formData.password) {
      setError('Заполните все обязательные поля');
      return;
    }

    if (!isLoginMode) {
      if (!formData.name) {
        setError('Введите ваше имя');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Пароли не совпадают');
        return;
      }
      if (!formData.agreeTerms) {
        setError('Необходимо принять условия использования');
        return;
      }
    }

    // В случае успеха вызываем коллбэк (или отправляем на сервер)
    if (onLoginSuccess) {
      onLoginSuccess({
        email: formData.email,
        name: formData.name || 'Трейдер'
      });
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {/* Шапка / Логотип */}
        <div style={styles.header}>
          <div style={styles.logoBadge}>
            <TrendingUp size={24} color="#3B82F6" />
          </div>
          <h1 style={styles.title}>NovaTrade</h1>
          <p style={styles.subtitle}>
            {isLoginMode
              ? 'Войдите в аккаунт для продолжения торговли'
              : 'Создайте аккаунт и получите $10,000 на демо-счёт'}
          </p>
        </div>

        {/* Переключатель Вход / Регистрация */}
        <div style={styles.modeSwitch}>
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(true);
              setError('');
            }}
            style={{
              ...styles.switchBtn,
              ...(isLoginMode ? styles.switchBtnActive : {})
            }}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(false);
              setError('');
            }}
            style={{
              ...styles.switchBtn,
              ...(!isLoginMode ? styles.switchBtnActive : {})
            }}
          >
            Регистрация
          </button>
        </div>

        {/* Сообщение об ошибке */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Форма */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Поле Имя (Только при регистрации) */}
          {!isLoginMode && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Ваше имя</label>
              <div style={styles.inputWrapper}>
                <User size={18} color="#64748B" style={styles.inputIcon} />
                <input
                  type="text"
                  name="name"
                  placeholder="Александр"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Электронная почта</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} color="#64748B" style={styles.inputIcon} />
              <input
                type="email"
                name="email"
                placeholder="trader@example.com"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          {/* Пароль */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Пароль</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#64748B" style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
              </button>
            </div>
          </div>

          {/* Повтор пароля (Только при регистрации) */}
          {!isLoginMode && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Повторите пароль</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} color="#64748B" style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>
          )}

          {/* Опции входа */}
          {isLoginMode ? (
            <div style={styles.optionsRow}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={styles.checkbox}
                />
                Запомнить меня
              </label>
              <a href="#forgot" style={styles.forgotLink}>
                Забыли пароль?
              </a>
            </div>
          ) : (
            <div style={styles.optionsRow}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                <span>
                  Принимаю <a href="#terms" style={styles.termsLink}>Пользовательское соглашение</a>
                </span>
              </label>
            </div>
          )}

          {/* Кнопка действия */}
          <button type="submit" style={styles.submitBtn}>
            <span>{isLoginMode ? 'Войти в терминал' : 'Создать аккаунт'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Разделитель */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>Или через</span>
          <span style={styles.dividerLine} />
        </div>

        {/* Вход через сторонние сервисы */}
        <div style={styles.socialGrid}>
          <button type="button" style={styles.socialBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            Google
          </button>

          <button type="button" style={styles.socialBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0088cc">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            Telegram
          </button>
        </div>

        {/* Футер безопасности */}
        <div style={styles.footerNote}>
          <ShieldCheck size={14} color="#10B981" />
          <span>256-bit SSL Защищённое соединение</span>
        </div>
      </div>
    </div>
  );
}

// Стили компонента
const styles = {
  overlay: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    padding: '20px',
    boxSizing: 'border-box',
    fontFamily: 'sans-serif'
  },
  card: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '440px',
    padding: '32px 28px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  logoBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    padding: '12px',
    borderRadius: '12px',
    display: 'inline-flex',
    marginBottom: '4px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#F8FAFC',
    margin: 0,
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '13px',
    color: '#94A3B8',
    margin: 0,
    lineHeight: '1.4'
  },
  modeSwitch: {
    display: 'flex',
    backgroundColor: '#0F172A',
    padding: '4px',
    borderRadius: '8px',
    border: '1px solid #334155'
  },
  switchBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    color: '#94A3B8',
    padding: '8px 0',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  switchBtnActive: {
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#EF4444',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    textAlign: 'center',
    fontWeight: '600'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
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
  input: {
    width: '100%',
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 40px 10px 38px',
    color: '#F8FAFC',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s'
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center'
  },
  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#94A3B8'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    userSelect: 'none'
  },
  checkbox: {
    accentColor: '#3B82F6',
    cursor: 'pointer'
  },
  forgotLink: {
    color: '#3B82F6',
    textDecoration: 'none',
    fontWeight: '600'
  },
  termsLink: {
    color: '#3B82F6',
    textDecoration: 'none'
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    marginTop: '6px'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '4px 0'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#334155'
  },
  dividerText: {
    fontSize: '11px',
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  socialGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  socialBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '9px',
    color: '#F8FAFC',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.15s'
  },
  footerNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#64748B',
    marginTop: '6px'
  }
};
