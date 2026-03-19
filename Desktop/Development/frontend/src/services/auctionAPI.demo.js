import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const demoCategories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Books' },
  { id: 3, name: 'Fashion' },
  { id: 4, name: 'Home & Garden' },
  { id: 5, name: 'Sports' },
  { id: 6, name: 'Toys' },
];

export const auctionAPI = {
  getCategories: async () => {
    // Try to fetch from backend, fallback to demo
    try {
      const res = await axios.get(`${API_URL}/auctions/categories/`);
      return res;
    } catch (e) {
      // fallback demo
      return { data: demoCategories };
    }
  },
  create: async (data) => {
    const token = localStorage.getItem('access_token');
    return axios.post(`${API_URL}/auctions/create/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  },
};
