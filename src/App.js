import './App.css';
import { useState } from 'react';
import LoginPage from './components/auth/LoginPage';
import { getStoredAdminSession } from './components/auth/authApi';
import BnplStatusPage from './components/bnpl/BnplStatusPage';
import AdminCopilot from './components/copilot/AdminCopilot';
import Dashboard from './components/Dashboard';
import OrderDeliveryPage from './components/order/OrderDeliveryPage';
import ProductManagement from './components/product/ProductManagement';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

const topbarTitles = {
  login: '관리자 로그인',
  dashboard: '대시보드',
  usageStatus: '외상(BNPL) 이용 및 연체 현황',
  productList: '',
  productCreate: '',
  productEdit: '',
  orderDelivery: '주문 및 배송 관리',
};

function App() {
  const [adminSession, setAdminSession] = useState(() => getStoredAdminSession());
  const [activePage, setActivePage] = useState(() => (getStoredAdminSession() ? 'dashboard' : 'login'));
  const isAuthenticated = Boolean(adminSession?.adminAccessToken);

  const handleNavigate = (page) => {
    setActivePage(isAuthenticated ? page : 'login');
  };

  const handleLoginSuccess = (session) => {
    setAdminSession(session);
    setActivePage('dashboard');
  };

  return (
    <div className="admin-app">
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />
      <div className="admin-shell">
        <TopBar title={topbarTitles[activePage]} />
        {activePage === 'login' && <LoginPage onLoginSuccess={handleLoginSuccess} />}
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'usageStatus' && <BnplStatusPage />}
        {(activePage === 'productList' || activePage === 'productCreate' || activePage === 'productEdit') && (
          <ProductManagement activePage={activePage} onNavigate={handleNavigate} />
        )}
        {activePage === 'orderDelivery' && <OrderDeliveryPage />}
        {activePage === 'dashboard' && <AdminCopilot />}
      </div>
    </div>
  );
}

export default App;
