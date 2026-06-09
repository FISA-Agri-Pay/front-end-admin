const formatTime = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const formatAmount = (amount) => `${Number(amount ?? 0).toLocaleString('ko-KR')}원`;

function RecentOrders({ orders = [], isLoading }) {
  return (
    <section className="panel orders-panel">
      <div className="panel__heading-row">
        <h3 className="panel__title">최근 접수 외상 주문 (상위 5건)</h3>
        <button type="button" aria-label="최근 접수 외상 주문 더보기">
          &gt;
        </button>
      </div>
      <div className="orders-table" role="table" aria-label="최근 접수 외상 주문">
        <div className="orders-table__row orders-table__row--head" role="row">
          <span role="columnheader">시간</span>
          <span role="columnheader">주문자</span>
          <span role="columnheader">상품명</span>
          <span role="columnheader">금액</span>
        </div>
        {isLoading && <div className="orders-table__empty" role="row">주문 정보를 불러오는 중입니다.</div>}
        {!isLoading && orders.length === 0 && <div className="orders-table__empty" role="row">최근 외상 주문이 없습니다.</div>}
        {!isLoading &&
          orders.map((order, index) => (
            <div className="orders-table__row" role="row" key={order.orderPublicId || `${order.orderedAt}-${index}`}>
              <span role="cell">{formatTime(order.orderedAt)}</span>
              <span role="cell">{order.userName || '-'}</span>
              <span role="cell">{order.orderDisplayName || order.firstProductName || '-'}</span>
              <strong role="cell">{formatAmount(order.amount)}</strong>
            </div>
          ))}
      </div>
    </section>
  );
}

export default RecentOrders;
