import { useEffect, useState } from 'react';
import ActionTasks from './dashboard/ActionTasks';
import RecentOrders from './dashboard/RecentOrders';
import RevenueChart from './dashboard/RevenueChart';
import StatCards from './dashboard/StatCards';
import { fetchDashboardSummary } from './dashboard/dashboardApi';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadDashboardSummary = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await fetchDashboardSummary();

        if (isMounted) {
          setSummary(data);
        }
      } catch (error) {
        if (isMounted) {
          setSummary(null);
          setErrorMessage(error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboardSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="dashboard">
      {(isLoading || errorMessage) && (
        <p className={`dashboard__message ${errorMessage ? 'dashboard__message--error' : ''}`} role={errorMessage ? 'alert' : 'status'}>
          {errorMessage || '대시보드 요약 정보를 불러오는 중입니다.'}
        </p>
      )}
      <StatCards summary={summary} isLoading={isLoading} />
      <RevenueChart data={summary?.recentSevenDaysBnplUsage ?? []} isLoading={isLoading} />
      <section className="dashboard__grid" aria-label="관리자 요약 정보">
        <ActionTasks actionRequired={summary?.actionRequired} isLoading={isLoading} />
        <RecentOrders orders={summary?.recentBnplOrders ?? []} isLoading={isLoading} />
      </section>
    </main>
  );
}

export default Dashboard;
