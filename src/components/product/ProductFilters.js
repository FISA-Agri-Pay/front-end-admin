import { PRODUCT_CATEGORIES, PRODUCT_STATUSES } from './productApi';

// 상품 목록 API의 categoryName, status, keyword 검색 조건을 입력받는 필터 컴포넌트이다.
function ProductFilters({ filters, onChange, onSearch }) {
  // 엔터 키나 검색 버튼으로만 실제 목록 조회를 실행한다.
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form className="product-filter" aria-label="상품 검색 필터" onSubmit={handleSubmit}>
      <select
        aria-label="상품 분류"
        value={filters.categoryName}
        onChange={(event) => onChange('categoryName', event.target.value)}
      >
        <option value="">분류: 전체</option>
        {/* 목록 조회 API는 categoryId가 아니라 categoryName 필터도 지원한다. */}
        {PRODUCT_CATEGORIES.map((category) => (
          <option key={category.id} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>
      <select
        aria-label="판매 상태"
        value={filters.status}
        onChange={(event) => onChange('status', event.target.value)}
      >
        <option value="">상태: 전체</option>
        {PRODUCT_STATUSES.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
      <label className="visually-hidden" htmlFor="product-search">
        상품명 또는 상품 번호 검색
      </label>
      <input
        id="product-search"
        placeholder="상품명 또는 상품 번호 검색"
        type="search"
        value={filters.keyword}
        onChange={(event) => onChange('keyword', event.target.value)}
      />
      <button className="button button--dark" type="submit">
        검색
      </button>
    </form>
  );
}

export default ProductFilters;
