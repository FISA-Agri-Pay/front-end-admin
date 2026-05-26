function ProductFilters() {
  return (
    <section className="product-filter" aria-label="상품 검색 필터">
      {/* TODO: 백엔드 상품 분류/상태 옵션 및 검색 API와 연동 */}
      <select defaultValue="all">
        <option value="all">분류: 전체</option>
        <option value="service">영농 서비스</option>
        <option value="fertilizer">비료/자재</option>
        <option value="seed">씨앗/모종</option>
      </select>
      <select defaultValue="all">
        <option value="all">상태: 전체</option>
        <option value="selling">판매 중</option>
        <option value="soldout">품절</option>
        <option value="paused">판매 중지</option>
      </select>
      <input placeholder="상품명 또는 상품 번호 검색" type="search" />
      <button className="button button--dark" type="button">
        검색
      </button>
    </section>
  );
}

export default ProductFilters;
