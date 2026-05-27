const stats = [
  // TODO: 백엔드의 한도 심사 대기 건수로 교체
  {
    id: 'limit-review',
    label: '한도 심사 대기',
    value: '12',
    unit: '건',
    icon: 'checklist',
    variant: 'green',
    actionText: '바로가기 >',
  },
  // TODO: 백엔드의 당월 외상 결제 총액으로 교체
  {
    id: 'monthly-payment-total',
    label: '당월 외상 결제 총액',
    value: '45,000,000',
    unit: '원',
    icon: 'circle',
  },
  // TODO: 백엔드의 당월 회수 예정액으로 교체
  {
    id: 'monthly-collection-expected',
    label: '당월 회수(상환) 예정액',
    value: '15,000,000',
    unit: '원',
    icon: 'arrow',
  },
  // TODO: 백엔드의 현재 서비스 연체율로 교체
  {
    id: 'current-overdue-rate',
    label: '현재 서비스 연체율',
    value: '2.8',
    unit: '%',
    icon: 'alert',
    variant: 'danger',
  },
];

function StatCards() {
  return (
    <section className="stat-grid" aria-label="핵심 지표">
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
    checklist: '⊢',
    circle: '○',
    arrow: '↓',
    alert: '!',
  };

  return icons[type] || '?';
}

export default StatCards;
