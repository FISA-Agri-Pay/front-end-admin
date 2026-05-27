import { useEffect, useMemo, useState } from 'react';
import ProductFilters from './ProductFilters';
import ProductTable from './ProductTable';
import { mergeCategoriesFromProducts, requestApi } from './productApi';

// 한 페이지에 표시할 상품 개수이다.
const PAGE_SIZE = 10;

// 상품 목록 조회, 필터, 일괄 처리, 페이지 이동을 담당하는 컴포넌트이다.
function ProductListPage({ onCategoriesLoaded = () => {}, onCreate, onEdit }) {
  // 사용자가 입력 중인 필터 상태이다.
  const [filters, setFilters] = useState({
    categoryName: '',
    status: '',
    keyword: '',
  });
  // 검색 버튼을 눌러 실제 조회에 적용된 필터 상태이다.
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [products, setProducts] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    totalPages: 0,
    first: true,
    last: true,
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 현재 페이지 주변의 최대 5개 페이지 번호만 계산한다.
  const pageNumbers = useMemo(() => {
    const totalPages = pageInfo.totalPages || 1;
    const currentPage = pageInfo.page;
    const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
    const end = Math.min(totalPages, start + 5);

    return Array.from({ length: end - start }, (_, index) => start + index);
  }, [pageInfo.page, pageInfo.totalPages]);

  // 백엔드 상품 목록 API를 호출하고 목록, 페이지 정보, 카테고리 옵션을 갱신한다.
  const fetchProducts = async (page = 0, nextFilters = appliedFilters) => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(PAGE_SIZE),
    });

    if (nextFilters.categoryName) {
      params.set('categoryName', nextFilters.categoryName);
    }
    if (nextFilters.status) {
      params.set('status', nextFilters.status);
    }
    if (nextFilters.keyword.trim()) {
      params.set('keyword', nextFilters.keyword.trim());
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await requestApi(
        `/products?${params.toString()}`,
        undefined,
        '상품 목록을 불러오지 못했습니다.'
      );

      setProducts(data.products);
      onCategoriesLoaded((currentCategories) => mergeCategoriesFromProducts(currentCategories, data.products));
      setPageInfo({
        page: data.page,
        totalPages: data.totalPages,
        first: data.first,
        last: data.last,
      });
      setSelectedIds([]);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 적용 필터가 바뀌면 첫 페이지부터 다시 조회한다.
  useEffect(() => {
    fetchProducts(0, appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  // 필터 입력값만 갱신하고 실제 조회는 검색 버튼에서 수행한다.
  const handleFilterChange = (name, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  // 현재 입력 중인 필터를 조회 조건으로 확정한다.
  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  // 개별 상품 체크박스 선택 상태를 토글한다.
  const handleSelect = (productPublicId) => {
    setSelectedIds((currentIds) =>
      currentIds.includes(productPublicId)
        ? currentIds.filter((id) => id !== productPublicId)
        : [...currentIds, productPublicId]
    );
  };

  // 현재 페이지의 상품만 전체 선택 또는 선택 해제한다.
  const handleSelectAll = () => {
    const currentPageIds = products.map((product) => product.publicId);
    const isAllSelected = currentPageIds.every((id) => selectedIds.includes(id));

    setSelectedIds(isAllSelected ? [] : currentPageIds);
  };

  // 상품을 DB에서 삭제하는 API 호출이다.
  const deleteProduct = async (productPublicId) => {
    await requestApi(
      `/products/${productPublicId}`,
      {
        method: 'DELETE',
      },
      '상품 삭제에 실패했습니다.'
    );
  };

  // 상품을 삭제하지 않고 HIDDEN 상태로 전환하는 판매 중지 API 호출이다.
  const pauseProduct = async (productPublicId) => {
    await requestApi(
      `/products/${productPublicId}/stop-selling`,
      {
        method: 'PATCH',
      },
      '상품 판매 중지에 실패했습니다.'
    );
  };

  // 단일 상품 삭제 버튼에서 사용하는 처리이다.
  const handleDelete = async (productPublicId) => {
    if (!window.confirm('선택한 상품을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteProduct(productPublicId);
      await fetchProducts(pageInfo.page);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // 선택된 상품들을 모두 판매 중지 처리한다.
  const handleBulkPause = async () => {
    if (selectedIds.length === 0) {
      setErrorMessage('판매 중지할 상품을 선택해 주세요.');
      return;
    }
    if (!window.confirm(`선택한 ${selectedIds.length}개 상품을 판매 중지하시겠습니까?`)) {
      return;
    }

    try {
      await Promise.all(selectedIds.map((productPublicId) => pauseProduct(productPublicId)));
      await fetchProducts(pageInfo.page);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // 선택된 상품들을 모두 삭제 처리한다.
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      setErrorMessage('삭제할 상품을 선택해 주세요.');
      return;
    }
    if (!window.confirm(`선택한 ${selectedIds.length}개 상품을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await Promise.all(selectedIds.map((productPublicId) => deleteProduct(productPublicId)));
      await fetchProducts(pageInfo.page);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // 페이지 범위를 벗어나지 않는 경우에만 해당 페이지를 조회한다.
  const handleChangePage = (nextPage) => {
    if (nextPage < 0 || nextPage >= pageInfo.totalPages || nextPage === pageInfo.page) {
      return;
    }
    fetchProducts(nextPage);
  };

  return (
    <main className="product-page">
      <div className="product-page__header">
        <h2>상품 관리 목록</h2>
        <button className="button button--primary" onClick={onCreate} type="button">
          + 신규 상품 등록
        </button>
      </div>
      <ProductFilters filters={filters} onChange={handleFilterChange} onSearch={handleSearch} />
      {errorMessage && <p className="product-page__message product-page__message--error">{errorMessage}</p>}
      {isLoading && <p className="product-page__message">상품 목록을 불러오는 중입니다.</p>}
      <ProductTable
        products={products}
        selectedIds={selectedIds}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
        onEdit={onEdit}
        onDelete={handleDelete}
      />
      <div className="product-page__footer">
        <div className="product-page__bulk-actions">
          <button className="button button--ghost" onClick={handleBulkPause} type="button">
            선택 상품 판매 중지
          </button>
          <button className="button button--danger-outline" onClick={handleBulkDelete} type="button">
            선택 상품 삭제
          </button>
        </div>
        <nav className="pagination" aria-label="상품 목록 페이지">
          <button
            type="button"
            aria-label="이전 페이지"
            disabled={pageInfo.first}
            onClick={() => handleChangePage(pageInfo.page - 1)}
          >
            ‹
          </button>
          {pageNumbers.map((page) => (
            <button
              className={page === pageInfo.page ? 'pagination__item--active' : ''}
              aria-current={page === pageInfo.page ? 'page' : undefined}
              key={page}
              type="button"
              onClick={() => handleChangePage(page)}
            >
              {page + 1}
            </button>
          ))}
          <button
            type="button"
            aria-label="다음 페이지"
            disabled={pageInfo.last}
            onClick={() => handleChangePage(pageInfo.page + 1)}
          >
            ›
          </button>
        </nav>
      </div>
    </main>
  );
}

export default ProductListPage;
