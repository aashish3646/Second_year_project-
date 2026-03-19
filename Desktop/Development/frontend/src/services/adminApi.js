import { http } from './http';

export const adminApi = {
  overview: () => http.get('admin/overview/'),
  reviewLogs: (limit = 20) => http.get(`admin/review-logs/?limit=${encodeURIComponent(limit)}`),
  stats: () => http.get('reports/stats/overview/'),
  transactions: () => http.get('reports/stats/transactions/'),
};

