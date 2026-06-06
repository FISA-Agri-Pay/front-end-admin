import { useState } from 'react';
import { loginAdmin, saveAdminSession } from './authApi';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPage({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;
    setFormData((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!emailPattern.test(formData.email.trim())) {
      return '올바른 이메일 형식을 입력해주세요';
    }
    if (!formData.password) {
      return '비밀번호를 입력해주세요';
    }
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateForm();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const session = await loginAdmin({
        email: formData.email.trim(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      });
      saveAdminSession(session, formData.rememberMe);
      onLoginSuccess(session);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-card__lock" aria-hidden="true">
          <span />
        </div>
        <h2 id="login-title">관리자 로그인</h2>
        <p>관리자 계정으로 로그인하세요</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form__field">
            <label htmlFor="admin-email">아이디</label>
            <div className="login-form__input-wrap">
              <input
                autoComplete="username"
                id="admin-email"
                name="email"
                onChange={handleChange}
                placeholder="admin@example.com"
                type="email"
                value={formData.email}
              />
            </div>
          </div>
          <div className="login-form__field">
            <label htmlFor="admin-password">비밀번호</label>
            <div className="login-form__input-wrap">
              <input
                autoComplete="current-password"
                id="admin-password"
                name="password"
                onChange={handleChange}
                placeholder="비밀번호"
                type={isPasswordVisible ? 'text' : 'password'}
                value={formData.password}
              />
              <button
                className="login-form__toggle"
                type="button"
                aria-label={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
                onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
              >
                {isPasswordVisible ? '숨김' : '보기'}
              </button>
            </div>
          </div>
          <label className="login-form__remember">
            <input
              checked={formData.rememberMe}
              name="rememberMe"
              onChange={handleChange}
              type="checkbox"
            />
            <span>로그인 상태 유지</span>
          </label>
          {errorMessage && (
            <p className="login-form__message login-form__message--error" role="alert" aria-atomic="true">
              {errorMessage}
            </p>
          )}
          <button className="button button--primary login-form__submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? '로그인 중' : '로그인'}
          </button>
        </form>
      </section>
      <footer className="login-page__footer">© 2026 BNP 관리 시스템 · 버전 2.4.1 · 최종 업데이트: 2026.05.12</footer>
    </main>
  );
}

export default LoginPage;
