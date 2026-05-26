const products = [
  // TODO: 백엔드 상품 목록 조회 결과로 교체
  {
    id: 'P10023',
    category: '영농 서비스',
    name: '드론 방제 서비스 (1,000평)',
    price: '1,500,000 원',
    stock: '99',
    status: '판매 중',
    statusTone: 'green',
  },
  {
    id: 'P10022',
    category: '비료/자재',
    name: '맞춤형 복합 비료 20kg (1포)',
    price: '15,000 원',
    stock: '0',
    status: '품절',
    statusTone: 'red',
  },
  {
    id: 'P10021',
    category: '씨앗/모종',
    name: '청양고추 모종 100구',
    price: '25,000 원',
    stock: '150',
    status: '판매 중',
    statusTone: 'green',
  },
  {
    id: 'P10020',
    category: '비료/자재',
    name: '친환경 유기농 퇴비 10kg',
    price: '12,000 원',
    stock: '35',
    status: '판매 중지',
    statusTone: 'gray',
  },
  {
    id: 'P10019',
    category: '영농 서비스',
    name: '트랙터 로터리 작업 (1일)',
    price: '300,000 원',
    stock: '5',
    status: '판매 중',
    statusTone: 'green',
  },
];

function ProductTable() {
  return (
    <section className="product-table-card">
      <div className="product-table" role="table" aria-label="상품 관리 목록">
        <div className="product-table__row product-table__row--head" role="row">
          <span role="columnheader">
            <input aria-label="전체 상품 선택" type="checkbox" />
          </span>
          <span role="columnheader">상품 번호</span>
          <span role="columnheader">이미지</span>
          <span role="columnheader">분류</span>
          <span role="columnheader">상품명</span>
          <span role="columnheader">판매가</span>
          <span role="columnheader">재고(잔여슬롯)</span>
          <span role="columnheader">판매 상태</span>
          <span role="columnheader">관리</span>
        </div>
        {products.map((product) => (
          <div className="product-table__row" role="row" key={product.id}>
            <span role="cell">
              <input aria-label={`${product.name} 선택`} type="checkbox" />
            </span>
            <span role="cell">{product.id}</span>
            <span role="cell">
              <span className="product-thumb" aria-hidden="true" />
            </span>
            <span role="cell">{product.category}</span>
            <button className="product-table__link" role="cell" type="button">
              {product.name}
            </button>
            <span role="cell">{product.price}</span>
            <strong className={product.stock === '0' ? 'product-table__stock--empty' : ''} role="cell">
              {product.stock}
            </strong>
            <span role="cell">
              <span className={`status-chip status-chip--${product.statusTone}`}>{product.status}</span>
            </span>
            <span className="product-table__actions" role="cell">
              <button type="button">수정</button>
              <button type="button">삭제</button>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProductTable;
