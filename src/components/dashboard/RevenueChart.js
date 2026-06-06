const chartData = [
  // TODO: 백엔드의 최근 7일 외상 이용 금액 데이터로 교체
  { date: '5/5', amount: 150, label: '150만' },
  { date: '5/6', amount: 225, label: '225만' },
  { date: '5/7', amount: 125, label: '125만' },
  { date: '5/8', amount: 375, label: '375만' },
  { date: '5/9', amount: 275, label: '275만' },
  { date: '5/10', amount: 75, label: '75만' },
  { date: '5/11', amount: 320, label: '320만', highlight: true },
];

function RevenueChart() {
  const maxAmount = Math.max(...chartData.map((item) => item.amount), 1);

  return (
    <section className="panel chart-panel">
      <h3 className="panel__title">최근 7일 외상 이용 추이</h3>
      <div className="chart" aria-label="최근 7일 외상 이용 추이 차트">
        <div className="chart__scale" aria-hidden="true">
          <span>{maxAmount}만</span>
          <span>{Math.round(maxAmount * 0.75)}만</span>
          <span>{Math.round(maxAmount * 0.5)}만</span>
          <span>{Math.round(maxAmount * 0.25)}만</span>
          <span>0</span>
        </div>
        <div className="chart__plot">
          <div className="chart__grid" aria-hidden="true" />
          <div className="chart__bars">
            {chartData.map((item) => (
              <div className="chart__bar-group" key={item.date}>
                {item.highlight && <strong className="chart__value">{item.label}</strong>}
                <div
                  className={`chart__bar ${item.highlight ? 'chart__bar--highlight' : ''}`}
                  style={{ height: `${(item.amount / maxAmount) * 100}%` }}
                  title={`${item.date} ${item.label}`}
                />
                <span className={item.highlight ? 'chart__date chart__date--highlight' : 'chart__date'}>{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default RevenueChart;
