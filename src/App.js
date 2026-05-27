import './App.css';
import { useState } from 'react';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/product/ProductManagement';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

const topbarTitles = {
  dashboard: '대시보드',
  productList: '',
  productCreate: '',
  productEdit: '',
};

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div className="admin-app">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="admin-shell">
        <TopBar title={topbarTitles[activePage]} />
        {activePage === 'dashboard' && <Dashboard />}
        {(activePage === 'productList' || activePage === 'productCreate' || activePage === 'productEdit') && (
          <ProductManagement activePage={activePage} onNavigate={setActivePage} />
        )}
      </div>
    </div>
  );
}

export default App;
