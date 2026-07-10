import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Calculator, CalculatorType } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

export const calculatorTypesApi = {
  getAll: () => api.get('/calculators/types'),
  create: (data: Partial<CalculatorType>) =>
    api.post('/admin/calculators/types', data),
  update: (id: string, data: Partial<CalculatorType>) =>
    api.put(`/admin/calculators/types/${id}`, data),
};

export const calculatorsApi = {
  getAll: () => api.get('/admin/calculators'),
  getBySlug: (slug: string) => api.get(`/calculators/${slug}`),
  create: (data: Partial<Calculator>) =>
    api.post('/admin/calculators', data),
  update: (id: string, data: Partial<Calculator>) =>
    api.put(`/admin/calculators/${id}`, data),
  delete: (id: string) =>
    api.delete(`/admin/calculators/${id}`),
};

export default api;