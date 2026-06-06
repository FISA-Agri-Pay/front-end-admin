import { requestAdminApi } from '../../api/adminApi';

export const ORDER_STATUSES = [
  { value: 'ALL', label: '주문 상태: 전체' },
  { value: 'CONFIRMED', label: '주문 확정' },
  { value: 'CANCELLED', label: '주문 취소' },
];

export const DELIVERY_STATUSES = [
  { value: 'ALL', label: '배송 상태: 전체' },
  { value: 'PREPARING', label: '배송 준비' },
  { value: 'SHIPPING', label: '배송 중' },
  { value: 'DELIVERED', label: '배송 완료' },
  { value: 'CANCELLED', label: '배송 취소' },
];

export const DELIVERY_STATUS_OPTIONS = DELIVERY_STATUSES.filter((status) => status.value !== 'ALL');

export const ORDER_STATUS_LABELS = ORDER_STATUSES.reduce(
  (labels, status) => ({
    ...labels,
    [status.value]: status.value === 'ALL' ? '전체' : status.label,
  }),
  {}
);

export const DELIVERY_STATUS_LABELS = DELIVERY_STATUSES.reduce(
  (labels, status) => ({
    ...labels,
    [status.value]: status.value === 'ALL' ? '전체' : status.label,
  }),
  {}
);

const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'ALL') {
      return;
    }
    searchParams.set(key, String(value));
  });

  return searchParams.toString();
};

export const fetchAdminOrders = ({ orderStatus, deliveryStatus, startDate, endDate, keyword, page, size }) => {
  const queryString = buildQueryString({
    orderStatus,
    deliveryStatus,
    startDate,
    endDate,
    keyword: keyword?.trim(),
    page,
    size,
  });

  const path = queryString ? `/orders?${queryString}` : '/orders';

  return requestAdminApi(path, undefined, '주문 목록을 불러오지 못했습니다.');
};

export const updateOrderDeliveryStatus = (orderPublicId, deliveryStatus) =>
  requestAdminApi(
    `/orders/${orderPublicId}/delivery-status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deliveryStatus }),
    },
    '배송 상태 변경에 실패했습니다.'
  );
