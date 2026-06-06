import { useEffect, useMemo, useState } from 'react';
import {
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_OPTIONS,
  DELIVERY_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  fetchAdminOrders,
  updateOrderDeliveryStatus,
} from './orderApi';

const PAGE_SIZE = 10;

const deliveryStatusTones = {
  PREPARING: 'gray',
  SHIPPING: 'orange',
  DELIVERED: 'green',
  CANCELLED: 'red',
};

const orderStatusTones = {
  CONFIRMED: 'green',
  CANCELLED: 'red',
};

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('ko-KR')} 원`;

const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const createDefaultFilters = () => ({
  orderStatus: 'ALL',
  deliveryStatus: 'ALL',
  startDate: '',
  endDate: '',
  keyword: '',
});

function OrderDeliveryPage() {
  const [filters, setFilters] = useState(createDefaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [orders, setOrders] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    totalPages: 1,
    totalElements: 0,
    first: true,
    last: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const pageNumbers = useMemo(() => {
    const totalPages = pageInfo.totalPages || 1;
    const currentPage = pageInfo.page || 1;
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const end = Math.min(totalPages, start + 4);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [pageInfo.page, pageInfo.totalPages]);

  const loadOrders = async (page = 1, nextFilters = appliedFilters) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await fetchAdminOrders({
        ...nextFilters,
        page,
        size: PAGE_SIZE,
      });

      setOrders(data?.orders ?? []);
      setPageInfo({
        page: data?.page ?? page,
        totalPages: data?.totalPages || 1,
        totalElements: data?.totalElements || 0,
        first: Boolean(data?.first),
        last: Boolean(data?.last),
      });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(1, appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  const handleFilterChange = (name, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setMessage('');
    setAppliedFilters(filters);
  };

  const handleReset = () => {
    const defaultFilters = createDefaultFilters();
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setMessage('');
  };

  const handleChangePage = (nextPage) => {
    if (nextPage < 1 || nextPage > pageInfo.totalPages || nextPage === pageInfo.page) {
      return;
    }
    loadOrders(nextPage);
  };

  const handleDeliveryStatusChange = async (order, deliveryStatus) => {
    if (!deliveryStatus || deliveryStatus === order.deliveryStatus) {
      return;
    }

    setUpdatingOrderId(order.orderPublicId);
    setMessage('');
    setErrorMessage('');

    try {
      await updateOrderDeliveryStatus(order.orderPublicId, deliveryStatus);
      setMessage('배송 상태를 변경했습니다.');
      await loadOrders(pageInfo.page);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setUpdatingOrderId('');
    }
  };

  return (
    <main className="order-page">
      <div className="order-page__header">
        <h2>주문 및 배송 관리</h2>
        <span>{pageInfo.totalElements.toLocaleString('ko-KR')}건</span>
      </div>

      <form className="order-filter" onSubmit={handleSearch}>
        <select
          aria-label="주문 상태"
          value={filters.orderStatus}
          onChange={(event) => handleFilterChange('orderStatus', event.target.value)}
        >
          {ORDER_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <select
          aria-label="배송 상태"
          value={filters.deliveryStatus}
          onChange={(event) => handleFilterChange('deliveryStatus', event.target.value)}
        >
          {DELIVERY_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <input
          aria-label="주문 시작일"
          type="date"
          value={filters.startDate}
          onChange={(event) => handleFilterChange('startDate', event.target.value)}
        />
        <input
          aria-label="주문 종료일"
          type="date"
          value={filters.endDate}
          onChange={(event) => handleFilterChange('endDate', event.target.value)}
        />
        <input
          aria-label="주문 검색어"
          placeholder="주문자, 연락처, 수령인 검색"
          type="search"
          value={filters.keyword}
          onChange={(event) => handleFilterChange('keyword', event.target.value)}
        />
        <button className="button button--dark" type="submit">
          검색
        </button>
        <button className="button button--ghost" type="button" onClick={handleReset}>
          초기화
        </button>
      </form>

      {message && <p className="order-page__message">{message}</p>}
      {errorMessage && <p className="order-page__message order-page__message--error">{errorMessage}</p>}
      {isLoading && <p className="order-page__message">주문 목록을 불러오는 중입니다.</p>}

      <section className="order-table-card">
        <div className="order-table" role="table" aria-label="주문 및 배송 목록">
          <div className="order-table__row order-table__row--head" role="row">
            <span role="columnheader">주문 일시</span>
            <span role="columnheader">주문자</span>
            <span role="columnheader">수령인</span>
            <span role="columnheader">주문 금액</span>
            <span role="columnheader">주문 상태</span>
            <span role="columnheader">배송 상태</span>
            <span role="columnheader">변경</span>
          </div>
          {orders.length === 0 && (
            <div className="order-table__empty" role="row">
              조회된 주문이 없습니다.
            </div>
          )}
          {orders.map((order) => {
            const isCancelled = order.orderStatus === 'CANCELLED';
            const isUpdating = updatingOrderId === order.orderPublicId;

            return (
              <div className="order-table__row" role="row" key={order.orderPublicId}>
                <span role="cell">{formatDateTime(order.orderedAt)}</span>
                <span role="cell">
                  <strong>{order.userName || '-'}</strong>
                  <small>{order.userPhone || '-'}</small>
                </span>
                <span role="cell">
                  <strong>{order.recipientName || '-'}</strong>
                  <small>{order.recipientPhone || '-'}</small>
                </span>
                <strong role="cell">{formatCurrency(order.totalAmount)}</strong>
                <span role="cell">
                  <span className={`status-chip status-chip--${orderStatusTones[order.orderStatus] || 'gray'}`}>
                    {ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}
                  </span>
                </span>
                <span role="cell">
                  <span className={`status-chip status-chip--${deliveryStatusTones[order.deliveryStatus] || 'gray'}`}>
                    {DELIVERY_STATUS_LABELS[order.deliveryStatus] || order.deliveryStatus}
                  </span>
                </span>
                <span role="cell">
                  <select
                    aria-label={`${order.userName || '주문'} 배송 상태 변경`}
                    disabled={isCancelled || isUpdating}
                    value={order.deliveryStatus}
                    onChange={(event) => handleDeliveryStatusChange(order, event.target.value)}
                  >
                    {DELIVERY_STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </span>
              </div>
            );
          })}
        </div>
        <div className="order-table-card__footer">
          <span>
            {pageInfo.page} / {pageInfo.totalPages || 1} 페이지
          </span>
          <nav className="pagination" aria-label="주문 목록 페이지">
            <button
              type="button"
              aria-label="이전 페이지"
              disabled={pageInfo.first || isLoading}
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
                disabled={isLoading}
                onClick={() => handleChangePage(page)}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              aria-label="다음 페이지"
              disabled={pageInfo.last || isLoading}
              onClick={() => handleChangePage(pageInfo.page + 1)}
            >
              ›
            </button>
          </nav>
        </div>
      </section>
    </main>
  );
}

export default OrderDeliveryPage;
