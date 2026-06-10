const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchCallLogs(filters = {}) {
  const params = new URLSearchParams();
  if (filters.dateFrom) params.set('date_from', filters.dateFrom);
  if (filters.dateTo) params.set('date_to', filters.dateTo);
  if (filters.timeFrom) params.set('time_from', filters.timeFrom);
  if (filters.timeTo) params.set('time_to', filters.timeTo);
  if (filters.mobile) params.set('mobile', filters.mobile);
  if (filters.policy) params.set('policy', filters.policy);
  if (filters.disconnected) params.set('disconnected', filters.disconnected);
  if (filters.page) params.set('page', filters.page);
  if (filters.pageSize) params.set('page_size', filters.pageSize);

  const res = await fetch(`${BASE_URL}/api/call-logs?${params.toString()}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
