const formatCurrency = (value) => `${Number(value || 0).toLocaleString('ko-KR')} 원`;
const formatCount = (value) => `${Number(value || 0).toLocaleString('ko-KR')} 건`;

function BnplSummaryCards({ summary }) {
  const cards = [
    {
      id: 'balance',
      icon: '총',
      label: '총 외상 이용 금액',
      value: formatCurrency(summary?.totalBalance),
      variant: 'green',
    },
    {
      id: 'scheduled',
      icon: '월',
      label: '당월 상환 예정 금액',
      value: formatCurrency(summary?.scheduledRepayment),
      variant: 'orange',
    },
    {
      id: 'overdue',
      icon: '!',
      label: '현재 연체 금액 및 연체율',
      value: formatCurrency(summary?.overdueAmount),
      rate: `${Number(summary?.overdueRate || 0).toFixed(1)}%`,
      variant: summary?.isOverdueAlert ? 'danger' : 'green',
    },
    {
      id: 'count',
      icon: '건',
      label: 'BNPL 이용 건수',
      value: formatCount(summary?.totalUsageCount),
      variant: 'plain',
    },
  ];

  return (
    <section className="bnpl-summary-grid" aria-label="BNPL 핵심 지표">
      {cards.map((card) => (
        <article className={`bnpl-summary-card bnpl-summary-card--${card.variant}`} key={card.id}>
          <div className="bnpl-summary-card__top">
            <span className="bnpl-summary-card__icon" aria-hidden="true">
              {card.icon}
            </span>
            <span className="bnpl-summary-card__label">{card.label}</span>
            {card.rate && <strong className="bnpl-summary-card__rate">{card.rate}</strong>}
          </div>
          <p className="bnpl-summary-card__value">{card.value}</p>
        </article>
      ))}
    </section>
  );
}

export default BnplSummaryCards;
