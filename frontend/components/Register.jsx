/**
 * frontend/components/Login.jsx
 * Страница входа в систему NovaTrade.
 * Интегрирована с реальным API и React Router.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, TrendingUp, ShieldCheck, AlertCircle, Loader2
} from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Заполните все обязательные поля');
      return;
    }

    setIsLoading(true);
    try {
      // api.auth.login автоматически сохранит токены в localStorage
      await api.auth.login(formData);
      navigate('/'); // Перенаправляем в терминал
    } catch (err) {
      const msg = err.response?.data?.message || 'Ошибка соединения с сервером';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        {/* Шапка */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <TrendingUp size={26} color="#3B82F6" />
          </div>
          <h1 className="auth-title">NovaTrade</h1>
          <p className="auth-subtitle">Войдите в аккаунт для продолжения торговли</p>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="auth-alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Электронная почта</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon-left" />
              <input
                type="email"
                name="email"
                placeholder="trader@example.com"
                value={formData.email}
                onChange={handleChange}
                className="auth-input"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Пароль</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon-left" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="auth-input"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="input-icon-right">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="auth-options-row">
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked className="auth-checkbox" />
              Запомнить меня
            </label>
            <Link to="/forgot-password" className="auth-link">Забыли пароль?</Link>
          </div>

          <button type="submit" disabled={isLoading} className="auth-btn-primary">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <span>Войти в терминал</span>}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Разделитель */}
        <div className="auth-divider">
          <span className="divider-line" />
          <span className="divider-text">Или через</span>
          <span className="divider-line" />
        </div>

        {/* Соцсети */}
        <div className="social-grid">
          <button type="button" className="social-btn">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
            </svg>
            Google
          </button>
          <button type="button" className="social-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0088cc">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            Telegram
          </button>
        </div>

        {/* Футер */}
        <div className="auth-footer">
          <span className="auth-footer-text">Нет аккаунта?</span>
          <Link to="/register" className="auth-link bold">Создать аккаунт</Link>
        </div>

        <div className="auth-security-note">
          <ShieldCheck size={14} color="#10B981" />
          <span>256-bit SSL Защищённое соединение</span>
        </div>
      </div>
    </div>
  );
}
