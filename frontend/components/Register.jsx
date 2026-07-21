
import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function Register({
  onSwitchToLogin,
  onRegisterSuccess
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Валидация пароля в реальном времени
  const hasMinLength = formData.password.length >= 8;
  const hasNumber = /\d/.test(formData.password);
  const hasLetter = /[a-zA-Zа-яА-Я]/.test(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setError('Введите ваше полное имя');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Введите корректный адрес электронной почты');
      return;
    }

    if (!hasMinLength || !hasNumber || !hasLetter) {
      setError('Пароль не соответствует всем требованиям безопасности');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (!formData.agreeTerms) {
      setError('Вы должны принять условия использования и политику конфиденциальности');
      return;
    }

    setIsLoading(true);

    // Имитация запроса регистрации
    setTimeout(() => {
      setIsLoading(false);
      if (onRegisterSuccess) {
        onRegisterSuccess(formData);
      } else {
        alert('Регистрация прошла успешно!');
      }
    }, 1200);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {/* Шапка формы */}
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <UserPlus size={26} color="#3B82F6" />
          </div>
          <h1 style={styles.title}>Создать аккаунт</h1>
          <p style={styles.subtitle}>
            Присоединяйтесь к платформе и начните торговлю прямо сейчас
          </p>
        </div>

        {/* Сообщение об ошибке */}
        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={16} color="#EF4444" />
            <span>{error}</span>
          </div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Имя и Фамилия */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Имя и Фамилия</label>
            <div style={styles.inputWrapper}>
              <User size={16} color="#64748B" style={styles.inputIcon} />
              <input
                type="text"
                name="fullName"
                placeholder="Александр Иванов"
                value={formData.fullName}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          {/* Email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Электронная почта</label>
            <div style={styles.inputWrapper}>
              <Mail size={16} color="#64748B" style={styles.inputIcon} />
              <input
                type="email"
                name="email"
                placeholder="example@mail.com"
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
              <Lock size={16} color="#64748B" style={styles.inputIcon} />
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
                {showPassword ? <EyeOff size={16} color="#64748B" /> : <Eye size={16} color="#64748B" />}
              </button>
            </div>
          </div>

          {/* Чеклист безопасности пароля */}
          {formData.password && (
            <div style={styles.passwordRules}>
              <div style={{ ...styles.ruleItem, color: hasMinLength ? '#10B981' : '#64748B' }}>
                <CheckCircle2 size={12} />
                <span>Минимум 8 символов</span>
              </div>
              <div style={{ ...styles.ruleItem, color: hasNumber ? '#10B981' : '#64748B' }}>
                <CheckCircle2 size={12} />
                <span>Содержит хотя бы 1 цифру</span>
              </div>
              <div style={{ ...styles.ruleItem, color: hasLetter ? '#10B981' : '#64748B' }}>
                <CheckCircle2 size={12} />
                <span>Содержит буквы</span>
              </div>
            </div>
          )}

          {/* Подтверждение пароля */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Повторите пароль</label>
            <div style={styles.inputWrapper}>
              <Lock size={16} color="#64748B" style={styles.inputIcon} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeBtn}
              >
                {showConfirmPassword ? <EyeOff size={16} color="#64748B" /> : <Eye size={16} color="#64748B" />}
              </button>
            </div>
          </div>

          {/* Условия использования */}
          <label style={styles.checkboxContainer}>
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              style={styles.checkbox}
            />
            <span style={styles.checkboxText}>
              Я принимаю <a href="#terms" style={styles.link}>Условия использования</a> и <a href="#privacy" style={styles.link}>Политику конфиденциальности</a>
            </span>
          </label>

          {/* Кнопка регистрации */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.submitBtn,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? (
              <span>Создание аккаунта...</span>
            ) : (
              <>
                <span>Зарегистрироваться</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Подвал с переключением на вход */}
        <div style={styles.footer}>
          <span style={{ color: '#94A3B8', fontSize: '13px' }}>Уже есть аккаунт?</span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={styles.switchBtn}
          >
            Войти
          </button>
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
  },
  card: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '32px 28px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconCircle: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#F8FAFC',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '13px',
    color: '#94A3B8',
    margin: 0,
    lineHeight: '1.4',
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid #EF4444',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#F87171',
    fontSize: '12px',
    fontWeight: '600',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#94A3B8',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 38px 10px 38px',
    color: '#F8FAFC',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
  },
  passwordRules: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    backgroundColor: '#0F172A',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #334155',
  },
  ruleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: '600',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    cursor: 'pointer',
    marginTop: '4px',
  },
  checkbox: {
    marginTop: '2px',
    accentColor: '#3B82F6',
    cursor: 'pointer',
  },
  checkboxText: {
    fontSize: '12px',
    color: '#94A3B8',
    lineHeight: '1.4',
  },
  link: {
    color: '#3B82F6',
    textDecoration: 'none',
  },
  submitBtn: {
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '8px',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
    transition: 'background-color 0.2s',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    borderTop: '1px solid #334155',
    paddingTop: '16px',
    marginTop: '4px',
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    padding: 0,
  },
};
