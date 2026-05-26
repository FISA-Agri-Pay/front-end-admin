import ProductFilters from './ProductFilters';
import ProductTable from './ProductTable';

function ProductListPage({ onNavigate }) {
  return (
    <main className="product-page">
      <div className="product-page__header">
        <h2>상품 관리 목록</h2>
        <button className="button button--primary" onClick={() => onNavigate('productCreate')} type="button">
          + 신규 상품 등록
        </button>
      </div>
      <ProductFilters />
      <ProductTable />
      <div className="product-page__footer">
        <div className="product-page__bulk-actions">
          <button className="button button--ghost" type="button">
            선택 상품 판매 중지
          </button>
          <button className="button button--danger-outline" type="button">
            선택 상품 삭제
          </button>
        </div>
        <nav className="pagination" aria-label="상품 목록 페이지">
          <button type="button" aria-label="이전 페이지">
            ‹
          </button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button className={page === 1 ? 'pagination__item--active' : ''} key={page} type="button">
              {page}
            </button>
          ))}
          <button type="button" aria-label="다음 페이지">
            ›
          </button>
        </nav>
      </div>
    </main>
  );
}

export default ProductListPage;
