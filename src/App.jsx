import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import DailyEntryForm from './components/DailyEntryForm';
import EntryList from './components/EntryList';
import Settlement from './components/Settlement';
import MemberManager from './components/MemberManager';
import LoginPage from './components/LoginPage';
import './App.css';

const TABS = [
  { id: 'entry', label: '📝 Nhập liệu', icon: '📝' },
  { id: 'history', label: '📋 Lịch sử', icon: '📋' },
  { id: 'settlement', label: '📊 Tổng kết', icon: '📊' },
  { id: 'members', label: '👥 Thành viên', icon: '👥' },
];

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('entry');

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <ExpenseProvider>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">
              <span className="title-icon">🍜</span>
              Quản lý tiền ăn
            </h1>
            <p className="app-subtitle">Gia đình chia sẻ chi phí bữa ăn</p>
          </div>
          <div className="user-info">
            <span className="user-name">
              👤 {user.displayName || user.email}
            </span>
            <button onClick={logout} className="btn-logout" id="logout-btn">
              Đăng xuất
            </button>
          </div>
        </header>

        <nav className="tab-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              id={`tab-${tab.id}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">
                {tab.label.split(' ').slice(1).join(' ')}
              </span>
            </button>
          ))}
        </nav>

        <main className="main-content">
          <div className="content-card">
            {activeTab === 'entry' && <DailyEntryForm />}
            {activeTab === 'history' && <EntryList />}
            {activeTab === 'settlement' && <Settlement />}
            {activeTab === 'members' && <MemberManager />}
          </div>
        </main>

        <footer className="app-footer">
          <p>🍜 Family Meal Tracker &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </ExpenseProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
