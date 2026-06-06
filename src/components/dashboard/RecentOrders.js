const orders = [
  // TODO: 백엔드의 최근 접수 외상 주문 상위 5건으로 교체
  { time: '14:02', customer: '김농부', product: '드론 방제 서비스 외 1건', amount: '1,500,000원' },
  { time: '13:45', customer: '이청년', product: '맞춤형 복합 비료 20kg 20포...', amount: '300,000원' },
  { time: '11:20', customer: '박과수', product: '청양고추 모종 100구', amount: '25,000원' },
  { time: '10:05', customer: '최이장', product: '트랙터 로터리 작업(1일)', amount: '300,000원' },
  { time: '09:30', customer: '정청년', product: '친환경 유기농 퇴비 10kg', amount: '12,000원' },
];

function RecentOrders() {
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
        {orders.map((order, index) => (
          <div className="orders-table__row" role="row" key={`${order.time}-${order.customer}-${index}`}>
            <span role="cell">{order.time}</span>
            <span role="cell">{order.customer}</span>
            <span role="cell">{order.product}</span>
            <strong role="cell">{order.amount}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecentOrders;
