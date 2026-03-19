import { http } from './http';

export const paymentsApi = {
  initiate(payload) {
    return http.post('payments/initiate/', payload);
  },
  detail(id) {
    return http.get(`payments/${id}/`);
  },
};

