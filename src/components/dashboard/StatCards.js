const toNumber = (value) => Number(value ?? 0);

const formatNumber = (value) => toNumber(value).toLocaleString('ko-KR');

const formatPercent = (value) =>
  toNumber(value).toLocaleString('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

function createStats(summary, isLoading) {
  const loadingValue = isLoading ? '...' : '0';

  return [
    {
      id: 'limit-review',
      label: '한도 심사 대기',
      value: summary ? formatNumber(summary.pendingCreditReviewCount) : loadingValue,
      unit: '건',
      icon: 'checklist',
      variant: 'green',
      actionText: '바로가기 >',
    },
    {
      id: 'monthly-payment-total',
      label: '당월 외상 결제 총액',
      value: summary ? formatNumber(summary.monthlyBnplPaymentAmount) : loadingValue,
      unit: '원',
      icon: 'circle',
    },
    {
      id: 'monthly-collection-expected',
      label: '당월 상환 예정 금액',
      value: summary ? formatNumber(summary.monthlyScheduledRepaymentAmount) : loadingValue,
      unit: '원',
      icon: 'arrow',
    },
    {
      id: 'current-overdue-rate',
      label: '현재 연체율',
      value: summary ? formatPercent(summary.currentOverdueRatePercent) : loadingValue,
      unit: '%',
      icon: 'alert',
      variant: 'danger',
    },
  ];
}

function StatCards({ summary, isLoading }) {
  const stats = createStats(summary, isLoading);

  return (
    <section className="stat-grid" aria-label="대시보드 주요 지표">
      {stats.map((stat) => (
        <article className={`stat-card ${stat.variant ? `stat-card--${stat.variant}` : ''}`} key={stat.id}>
          <div className="stat-card__top">
            <span className="stat-card__icon" aria-hidden="true">
              {getIcon(stat.icon)}
            </span>
            <span className="stat-card__label">{stat.label}</span>
            {stat.actionText && (
              <button className="stat-card__link" type="button">
                {stat.actionText}
              </button>
            )}
          </div>
          <p className="stat-card__value">
            {stat.value}
            <span>{stat.unit}</span>
          </p>
        </article>
      ))}
    </section>
  );
}

function getIcon(type) {
  const icons = {
    checklist: '✓',
    circle: '₩',
    arrow: '↗',
    alert: '!',
  };

  return icons[type] || '-';
}

export default StatCards;
