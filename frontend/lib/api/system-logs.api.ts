import { apiFetch } from './interceptor';

export interface GetLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  fromDate?: string;
  toDate?: string;
}

export function getSystemLogs(params: GetLogsParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);
  if (params.action) searchParams.set('action', params.action);
  if (params.fromDate) searchParams.set('fromDate', params.fromDate);
  if (params.toDate) searchParams.set('toDate', params.toDate);

  const query = searchParams.toString();
  return apiFetch<any>(`/api/admin/logs${query ? `?${query}` : ''}`);
}
