const toNumber = (value) => Number(value ?? 0);

const formatDateLabel = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const formatAmountLabel = (amount) => {
  const amountInTenThousand = Math.round(toNumber(amount) / 10000);

  if (amountInTenThousand >= 10000) {
    return `${Math.round(amountInTenThousand / 10000).toLocaleString('ko-KR')}억`;
  }

  return `${amountInTenThousand.toLocaleString('ko-KR')}만`;
};

function RevenueChart({ data = [], isLoading }) {
  const chartData = data.map((item, index) => ({
    date: formatDateLabel(item.date),
    amount: toNumber(item.amount),
    label: formatAmountLabel(item.amount),
    highlight: index === data.length - 1,
  }));
  const maxAmount = Math.max(...chartData.map((item) => item.amount), 1);

  return (
    <section className="panel chart-panel">
      <h3 className="panel__title">최근 7일 외상 이용 추이</h3>
      {isLoading && <p className="dashboard-panel__message">차트 데이터를 불러오는 중입니다.</p>}
      {!isLoading && chartData.length === 0 && <p className="dashboard-panel__message">표시할 이용 추이가 없습니다.</p>}
      {!isLoading && chartData.length > 0 && (
        <div className="chart" aria-label="최근 7일 외상 이용 추이 차트">
          <div className="chart__scale" aria-hidden="true">
            <span>{formatAmountLabel(maxAmount)}</span>
            <span>{formatAmountLabel(maxAmount * 0.75)}</span>
            <span>{formatAmountLabel(maxAmount * 0.5)}</span>
            <span>{formatAmountLabel(maxAmount * 0.25)}</span>
            <span>0</span>
          </div>
          <div className="chart__plot">
            <div className="chart__grid" aria-hidden="true" />
            <div className="chart__bars">
              {chartData.map((item) => (
                <div className="chart__bar-group" key={item.date}>
                  <div
                    className={`chart__bar ${item.highlight ? 'chart__bar--highlight' : ''}`}
                    style={{ height: `${(item.amount / maxAmount) * 100}%` }}
                    role="img"
                    aria-label={`${item.date} 외상 이용액 ${item.label}`}
                    title={`${item.date} ${item.label}`}
                  >
                    {item.highlight && <strong className="chart__value">{item.label}</strong>}
                  </div>
                </div>
              ))}
            </div>
            <div className="chart__dates" aria-hidden="true">
              {chartData.map((item) => (
                <span key={item.date} className={item.highlight ? 'chart__date chart__date--highlight' : 'chart__date'}>{item.date}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default RevenueChart;
