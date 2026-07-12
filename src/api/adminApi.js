let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

const configuredApiBaseUrl = (process.env.REACT_APP_ADMIN_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

export const API_ORIGIN = configuredApiBaseUrl.replace(/\/api\/v1\/admin$/, '');
export const ADMIN_API_BASE_URL = configuredApiBaseUrl.endsWith('/api/v1/admin')
  ? configuredApiBaseUrl
  : `${configuredApiBaseUrl}/api/v1/admin`;

export const getStoredAdminToken = () => {
  try {
    return localStorage.getItem('adminAccessToken') || sessionStorage.getItem('adminAccessToken') || '';
  } catch (error) {
    return '';
  }
};

export const buildAdminHeaders = (headers = {}, { includeAuth = true } = {}) => {
  const token = includeAuth ? getStoredAdminToken() : '';

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
};

export const isSuccessResponse = (body) => body?.success === true || body?.status === 'SUCCESS';

export const getAdminErrorMessage = (body, fallbackMessage, response) => {
  if (body?.error?.message || body?.message) {
    return body?.error?.message || body?.message;
  }
  if (response?.status === 401) {
    return '로그인이 만료되었습니다. 다시 로그인해주세요.';
  }
  if (response?.status === 403) {
    return '해당 관리자 기능에 접근할 권한이 없습니다.';
  }
  if (response?.status === 405) {
    return `${fallbackMessage} 백엔드 서버에 해당 API가 반영되었는지 확인해주세요.`;
  }

  return fallbackMessage;
};

export const parseJsonResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  return contentType.includes('application/json') ? response.json() : null;
};

export const requestAdminApi = async (
  path,
  options = {},
  fallbackMessage = '요청 처리에 실패했습니다.',
  requestOptions = {}
) => {
  const response = await fetch(`${ADMIN_API_BASE_URL}${path}`, {
    ...options,
    headers: buildAdminHeaders(options?.headers, requestOptions),
  });
  const body = await parseJsonResponse(response);

  if (!response.ok) {
    if (response.status === 401 && typeof unauthorizedHandler === 'function') {
      unauthorizedHandler();
    }
    throw new Error(getAdminErrorMessage(body, fallbackMessage, response));
  }

  if (body && !isSuccessResponse(body)) {
    throw new Error(getAdminErrorMessage(body, fallbackMessage, response));
  }

  return body?.data ?? null;
};
