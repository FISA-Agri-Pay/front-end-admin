import './App.css';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

function App() {
  return (
    <div className="admin-app">
      <Sidebar />
      <div className="admin-shell">
        <TopBar />
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
