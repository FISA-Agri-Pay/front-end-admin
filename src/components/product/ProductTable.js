import { PRODUCT_STATUSES, resolveProductImageUrl } from './productApi';

// 상태 코드와 화면 표시 라벨을 빠르게 찾기 위한 맵
const statusLabels = PRODUCT_STATUSES.reduce(
  (labels, status) => ({
    ...labels,
    [status.value]: status.label,
  }),
  {}
);

// 상태 코드별 배지 색상 클래스 이름
const statusTones = {
  ON_SALE: 'green',
  HIDDEN: 'gray',
};

// 백엔드 숫자 가격을 원화 표시 문자열로 변환하는 함수
const formatPrice = (price) => `${Number(price || 0).toLocaleString('ko-KR')} 원`;

// 상품 목록을 표 형태로 보여주고 선택, 수정, 삭제 이벤트를 부모에게 전달하는 컴포넌트
function ProductTable({ products, selectedIds, onSelect, onSelectAll, onEdit, onDelete }) {
  // 현재 페이지의 상품이 모두 선택되었는지 계산한다.
  const isAllSelected = products.length > 0 && products.every((product) => selectedIds.includes(product.publicId));

  return (
    <section className="product-table-card">
      <div className="product-table" role="table" aria-label="상품 관리 목록">
        <div className="product-table__row product-table__row--head" role="row">
          <span role="columnheader">
            <input aria-label="전체 상품 선택" checked={isAllSelected} onChange={onSelectAll} type="checkbox" />
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
        {products.length === 0 && (
          <div className="product-table__empty" role="row">
            조회된 상품이 없습니다.
          </div>
        )}
        {/* 상품 publicId는 수정, 삭제, 판매 중지 API의 경로 변수로 사용되는 식별자 */}
        {products.map((product) => {
          const productImageUrl = resolveProductImageUrl(product.imageUrl);

          return (
            <div className="product-table__row" role="row" key={product.publicId}>
              <span role="cell">
                <input
                  aria-label={`${product.name} 선택`}
                  checked={selectedIds.includes(product.publicId)}
                  onChange={() => onSelect(product.publicId)}
                  type="checkbox"
                />
              </span>
              <span role="cell">{product.productNumber}</span>
              <span role="cell">
                {productImageUrl ? (
                  <img className="product-thumb product-thumb--image" src={productImageUrl} alt="" />
                ) : (
                  <span className="product-thumb" aria-hidden="true" />
                )}
              </span>
              <span role="cell">{product.categoryName}</span>
              <span role="cell">
                <button className="product-table__link" type="button" onClick={() => onEdit(product)}>
                  {product.name}
                </button>
              </span>
              <span role="cell">{formatPrice(product.price)}</span>
              <strong className={product.stockQuantity === 0 ? 'product-table__stock--empty' : ''} role="cell">
                {product.stockQuantity}
              </strong>
              <span role="cell">
                <span className={`status-chip status-chip--${statusTones[product.status] || 'gray'}`}>
                  {statusLabels[product.status] || product.status}
                </span>
              </span>
              <span className="product-table__actions" role="cell">
                <button aria-label={`${product.name} 수정`} onClick={() => onEdit(product)} type="button">
                  수정
                </button>
                <button aria-label={`${product.name} 삭제`} onClick={() => onDelete(product.publicId)} type="button">
                  삭제
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ProductTable;
