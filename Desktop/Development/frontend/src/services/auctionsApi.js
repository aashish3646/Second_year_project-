import { http } from './http';

export const auctionsApi = {
  list(params) {
    return http.get('auctions/', { params });
  },
  detail(id) {
    return http.get(`auctions/${id}/`);
  },
  mine() {
    return http.get('auctions/mine/');
  },
  categories() {
    return http.get('auctions/categories/');
  },
  create(payload) {
    return http.post('auctions/', payload);
  },
  update(id, payload) {
    return http.patch(`auctions/${id}/`, payload);
  },
  bids(auctionId) {
    return http.get(`auctions/${auctionId}/bids/`);
  },
  placeBid(auctionId, payload) {
    return http.post(`auctions/${auctionId}/bids/`, payload);
  },
  adminReview(id, action, remarks) {
    return http.post(`auctions/${id}/admin-review/`, { action, remarks });
  },
};

