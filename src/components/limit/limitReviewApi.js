import { requestAdminApi } from '../../api/adminApi';

const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    searchParams.set(key, String(value));
  });

  return searchParams.toString();
};

export const fetchCreditReviews = ({ status = 'PENDING', page = 0, size = 20 } = {}) => {
  const queryString = buildQueryString({ status, page, size });

  return requestAdminApi(`/credit-reviews?${queryString}`, undefined, '한도 심사 목록을 불러오지 못했습니다.');
};

export const fetchCreditReviewDetail = (publicId) =>
  requestAdminApi(`/credit-reviews/${publicId}`, undefined, '한도 심사 상세 정보를 불러오지 못했습니다.');

export const approveCreditReview = (publicId, { reviewedBy, approvedAmount }) =>
  requestAdminApi(
    `/credit-reviews/${publicId}/approve`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reviewedBy,
        approvedAmount,
      }),
    },
    '한도 승인 처리에 실패했습니다.'
  );

export const rejectCreditReview = (publicId, { reviewedBy, reasonCode, reason }) =>
  requestAdminApi(
    `/credit-reviews/${publicId}/reject`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reviewedBy,
        reasonCode,
        reason,
      }),
    },
    '한도 반려 처리에 실패했습니다.'
  );
