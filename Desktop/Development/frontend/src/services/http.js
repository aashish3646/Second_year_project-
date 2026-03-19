import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export const http = axios.create({
  baseURL: API_BASE,
});

http.interceptors.request.use((config) => {
  const access = tokenStorage.getAccess();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

let refreshPromise = null;

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;

    if (status !== 401 || original?._retry) {
      return Promise.reject(error);
    }

    original._retry = true;
    const refresh = tokenStorage.getRefresh();
    if (!refresh) {
      tokenStorage.clear();
      return Promise.reject(error);
    }

    try {
      if (!refreshPromise) {
        refreshPromise = axios.post(`${API_BASE}/auth/refresh`, { refresh });
      }

      const { data } = await refreshPromise;
      refreshPromise = null;

      tokenStorage.setAccess(data.access);
      original.headers.Authorization = `Bearer ${data.access}`;
      return http(original);
    } catch (e) {
      refreshPromise = null;
      tokenStorage.clear();
      return Promise.reject(e);
    }
  }
);

