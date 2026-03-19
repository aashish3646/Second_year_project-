import { http } from './http';

export const notificationsApi = {
  list() {
    return http.get('notifications/');
  },
  markRead(payload) {
    return http.post('notifications/mark-read/', payload);
  },
};

