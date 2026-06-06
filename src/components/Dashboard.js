import ActionTasks from './dashboard/ActionTasks';
import RecentOrders from './dashboard/RecentOrders';
import RevenueChart from './dashboard/RevenueChart';
import StatCards from './dashboard/StatCards';

function Dashboard() {
  return (
    <main className="dashboard">
      <StatCards />
      <RevenueChart />
      <section className="dashboard__grid" aria-label="관리자 요약 정보">
        <ActionTasks />
        <RecentOrders />
      </section>
    </main>
  );
}

export default Dashboard;
