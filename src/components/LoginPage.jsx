import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      const messages = {
        'auth/user-not-found': 'Tài khoản không tồn tại',
        'auth/wrong-password': 'Sai mật khẩu',
        'auth/invalid-credential': 'Email hoặc mật khẩu không đúng',
        'auth/invalid-email': 'Email không hợp lệ',
      };
      setError(messages[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <span className="login-icon">🍜</span>
          <h1>Quản lý tiền ăn</h1>
          <p>Gia đình chia sẻ chi phí bữa ăn</p>
        </div>

        <div className="login-card">
          <h2>🔐 Đăng nhập</h2>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">📧 Email</label>
              <input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">🔒 Mật khẩu</label>
              <input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={loading}
              id="login-btn"
            >
              {loading ? '⏳ Đang xử lý...' : '🔐 Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
