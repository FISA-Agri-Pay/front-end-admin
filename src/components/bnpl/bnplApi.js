import {
  ADMIN_API_BASE_URL,
  buildAdminHeaders,
  getAdminErrorMessage,
  parseJsonResponse,
  requestAdminApi,
} from '../../api/adminApi';

export const BNPL_STATUSES = [
  { value: 'ALL', label: '상태: 전체' },
  { value: 'NORMAL', label: '정상 이용' },
  { value: 'OVERDUE', label: '연체 중' },
  { value: 'SUSPENDED', label: '이용 정지' },
  { value: 'REPAID', label: '상환 완료' },
];

export const BNPL_STATUS_LABELS = BNPL_STATUSES.reduce(
  (labels, status) => ({
    ...labels,
    [status.value]: status.value === 'ALL' ? '전체' : status.label,
  }),
  {}
);

const requestBnplApi = (path, options = {}, fallbackMessage = '요청 처리에 실패했습니다.') =>
  requestAdminApi(path, options, fallbackMessage);

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

const getExportFileName = (response) => {
  const disposition = response.headers.get('content-disposition') || '';
  const fileNameMatch = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);

  if (fileNameMatch?.[1]) {
    return decodeURIComponent(fileNameMatch[1]);
  }

  return `bnpl_users_${new Date().toISOString().slice(0, 10)}.xlsx`;
};

export const fetchBnplSummary = () => requestBnplApi('/bnpl/summary', undefined, '이용 현황을 불러오지 못했습니다.');

export const fetchBnplUsers = ({ startDate, endDate, search, status, page, size }) => {
  const queryString = buildQueryString({
    startDate,
    endDate,
    search: search?.trim(),
    status,
    page,
    size,
  });

  return requestBnplApi(`/bnpl/users?${queryString}`, undefined, '사용자별 이용 현황을 불러오지 못했습니다.');
};

export const downloadBnplUsersExcel = async ({ startDate, endDate, search, status }) => {
  const queryString = buildQueryString({
    startDate,
    endDate,
    search: search?.trim(),
    status,
  });

  const response = await fetch(`${ADMIN_API_BASE_URL}/bnpl/users/export?${queryString}`, {
    headers: buildAdminHeaders(),
  });

  if (!response.ok) {
    const body = await parseJsonResponse(response);
    throw new Error(getAdminErrorMessage(body, '엑셀 다운로드에 실패했습니다.', response));
  }

  return {
    blob: await response.blob(),
    fileName: getExportFileName(response),
  };
};

export const sendRepaymentAlert = (userPublicId) =>
  requestBnplApi(
    `/bnpl/users/${userPublicId}/repayment-alert`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        alertType: 'REPAYMENT',
      }),
    },
    '상환 안내 알림톡 발송에 실패했습니다.'
  );

export const sendOverdueAlert = (userPublicId) =>
  requestBnplApi(
    '/bnpl/overdue/alerts',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userPublicIds: [userPublicId],
        alertType: 'OVERDUE',
      }),
    },
    '연체 독촉톡 발송에 실패했습니다.'
  );
