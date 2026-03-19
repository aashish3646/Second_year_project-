import { http } from './http';

export const bidsApi = {
  mine: () => http.get('bids/'),
  update: (id, amount) => http.patch(`bids/${id}/`, { amount }),
};
