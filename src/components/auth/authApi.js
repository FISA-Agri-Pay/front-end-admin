import { ADMIN_API_BASE_URL, isSuccessResponse, parseJsonResponse } from '../../api/adminApi';

const AUTH_ERROR_MESSAGES = {
  AUTH_4001: '이메일 또는 비밀번호를 확인해주세요',
  AUTH_4002: '로그인 시도가 5회 초과되어 30분간 잠금됩니다',
  AUTH_4003: '비활성화된 계정입니다. 관리자에게 문의하세요',
  AUTH_4004: '올바른 이메일 형식을 입력해주세요',
};

const STORAGE_KEYS = ['adminAccessToken', 'refreshToken', 'adminId', 'adminName', 'adminRole'];

const getErrorCode = (body) => body?.error?.code || body?.code || body?.errorCode;

const getLoginErrorMessage = (body, fallbackMessage) => {
  const code = getErrorCode(body);

  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }

  return body?.error?.message || body?.message || fallbackMessage;
};

export const normalizeAdminSession = (session = {}) => {
  const admin = session.admin || session.user || {};

  return {
    adminAccessToken: session.adminAccessToken || session.accessToken || session.token || '',
    refreshToken: session.refreshToken || '',
    adminId: session.adminId || admin.publicId || admin.adminId || admin.id || session.id || '',
    name: session.name || session.adminName || admin.name || admin.adminName || '',
    role: session.role || session.adminRole || admin.role || admin.adminRole || '',
  };
};

export const loginAdmin = async ({ email, password, rememberMe }) => {
  const response = await fetch(`${ADMIN_API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      rememberMe,
    }),
  });
  const body = await parseJsonResponse(response);

  if (!response.ok || !isSuccessResponse(body)) {
    throw new Error(getLoginErrorMessage(body, '로그인에 실패했습니다.'));
  }

  return normalizeAdminSession(body?.data);
};

export const saveAdminSession = (session, rememberMe) => {
  try {
    const targetStorage = rememberMe ? localStorage : sessionStorage;
    const staleStorage = rememberMe ? sessionStorage : localStorage;
    const values = {
      adminAccessToken: session.adminAccessToken,
      refreshToken: session.refreshToken,
      adminId: session.adminId,
      adminName: session.name,
      adminRole: session.role,
    };

    STORAGE_KEYS.forEach((key) => {
      staleStorage.removeItem(key);
    });

    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        targetStorage.setItem(key, value);
      }
    });
  } catch (error) {
    // Storage may be unavailable in private or restricted browser contexts.
  }
};

export const clearAdminSession = () => {
  try {
    STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  } catch (error) {
    // Storage may be unavailable in private or restricted browser contexts.
  }
};

export const getStoredAdminSession = () => {
  try {
    const storage = localStorage.getItem('adminAccessToken') ? localStorage : sessionStorage;
    const adminAccessToken = storage.getItem('adminAccessToken');

    if (!adminAccessToken) {
      return null;
    }

    return {
      adminAccessToken,
      refreshToken: storage.getItem('refreshToken') || '',
      adminId: storage.getItem('adminId') || '',
      name: storage.getItem('adminName') || '',
      role: storage.getItem('adminRole') || '',
    };
  } catch (error) {
    return null;
  }
};
