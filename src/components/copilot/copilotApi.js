import { getStoredAdminToken, parseJsonResponse } from '../../api/adminApi';
import { getStoredAdminSession } from '../auth/authApi';

const isLocalBrowser =
  typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

const getDefaultAiopsBaseUrl = () => {
  if (isLocalBrowser) {
    return 'http://localhost:8000';
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return `${window.location.origin}/api/v1/admin`;
  }

  return '';
};

const configuredAiopsBaseUrl = process.env.REACT_APP_AIOPS_API_BASE_URL || getDefaultAiopsBaseUrl();

export const AIOPS_API_BASE_URL = configuredAiopsBaseUrl.replace(/\/$/, '');

const buildAiopsUrl = (path) => {
  if (!AIOPS_API_BASE_URL) {
    throw new Error('AIOps API 주소가 설정되지 않았습니다. REACT_APP_AIOPS_API_BASE_URL 값을 확인해주세요.');
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (AIOPS_API_BASE_URL.endsWith('/admin') && normalizedPath.startsWith('/admin/')) {
    return `${AIOPS_API_BASE_URL}${normalizedPath.slice('/admin'.length)}`;
  }

  return `${AIOPS_API_BASE_URL}${normalizedPath}`;
};

const getAiopsErrorMessage = (body, fallbackMessage, response) => {
  if (typeof body?.detail === 'string') {
    return body.detail;
  }

  if (Array.isArray(body?.detail) && body.detail[0]?.msg) {
    return body.detail[0].msg;
  }

  if (body?.error?.message || body?.message) {
    return body?.error?.message || body?.message;
  }

  if (response?.status === 404) {
    return '관리자 챗봇 API를 찾을 수 없습니다. AIOps API 배포 주소를 확인해주세요.';
  }

  return fallbackMessage;
};

const buildAiopsHeaders = (headers = {}) => {
  const token = getStoredAdminToken();
  const adminSession = getStoredAdminSession();

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(adminSession?.role ? { 'X-Admin-Role': adminSession.role } : {}),
    ...headers,
  };
};

export const requestAiopsApi = async (
  path,
  options = {},
  fallbackMessage = '관리자 챗봇 요청 처리에 실패했습니다.'
) => {
  const response = await fetch(buildAiopsUrl(path), {
    ...options,
    headers: buildAiopsHeaders(options?.headers),
  });
  const body = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(getAiopsErrorMessage(body, fallbackMessage, response));
  }

  return body ?? null;
};

export const askAdminCopilot = ({ message, sessionId, userId }) =>
  requestAiopsApi(
    '/admin/copilot/ask',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        session_id: sessionId || null,
        user_id: userId || 'admin-1',
      }),
    },
    '관리자 챗봇 답변을 가져오지 못했습니다.'
  );

export const fetchAdminCopilotSessions = ({ userId, status = 'OPEN', limit = 5 } = {}) => {
  const searchParams = new URLSearchParams();

  if (userId) {
    searchParams.set('user_id', userId);
  }
  if (status) {
    searchParams.set('status', status);
  }
  searchParams.set('limit', String(limit));

  return requestAiopsApi(
    `/admin/copilot/sessions?${searchParams.toString()}`,
    undefined,
    '최근 챗봇 대화 목록을 불러오지 못했습니다.'
  );
};
