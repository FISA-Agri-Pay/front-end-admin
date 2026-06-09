import { requestAdminApi } from '../../api/adminApi';

export const fetchDashboardSummary = () =>
  requestAdminApi('/dashboard/summary', undefined, '대시보드 요약 정보를 불러오지 못했습니다.');
