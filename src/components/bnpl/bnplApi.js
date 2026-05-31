const API_ORIGIN = (process.env.REACT_APP_ADMIN_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
const ADMIN_API_BASE_URL = API_ORIGIN.endsWith('/api/v1/admin') ? API_ORIGIN : `${API_ORIGIN}/api/v1/admin`;

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

const getStoredToken = () => {
  try {
    return localStorage.getItem('adminAccessToken') || sessionStorage.getItem('adminAccessToken') || '';
  } catch (error) {
    return '';
  }
};

const buildHeaders = (headers = {}) => {
  const token = getStoredToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
};

const getErrorMessage = (body, fallbackMessage, response) => {
  if (body?.error?.message || body?.message) {
    return body?.error?.message || body?.message;
  }
  if (response?.status === 401) {
    return '로그인이 만료되었습니다. 다시 로그인해 주세요.';
  }
  if (response?.status === 403) {
    return '해당 관리자 기능에 접근할 권한이 없습니다.';
  }
  return fallbackMessage;
};

const requestBnplApi = async (path, options = {}, fallbackMessage = '요청 처리에 실패했습니다.') => {
  const response = await fetch(`${ADMIN_API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers),
  });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(getErrorMessage(body, fallbackMessage, response));
  }

  if (body && body.success !== true) {
    throw new Error(getErrorMessage(body, fallbackMessage, response));
  }

  return body?.data ?? null;
};

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
    headers: buildHeaders(),
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await response.json() : null;
    throw new Error(getErrorMessage(body, '엑셀 다운로드에 실패했습니다.', response));
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
