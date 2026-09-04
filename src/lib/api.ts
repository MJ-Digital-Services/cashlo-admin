import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Calculator, CalculatorType, Blog, Category } from '@/types';

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
  create: (data: Partial<CalculatorType>) => api.post('/admin/calculators/types', data),
  update: (id: string, data: Partial<CalculatorType>) => api.put(`/admin/calculators/types/${id}`, data),
};

export const calculatorsApi = {
  getAll: () => api.get('/admin/calculators'),
  getBySlug: (slug: string) => api.get(`/calculators/${slug}`),
  create: (data: Partial<Calculator>) => api.post('/admin/calculators', data),
  update: (id: string, data: Partial<Calculator>) => api.put(`/admin/calculators/${id}`, data),
  delete: (id: string) => api.delete(`/admin/calculators/${id}`),
};

export const blogsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/admin/blogs', { params }),

  getById: (id: string) =>
    api.get(`/admin/blogs/id/${id}`),

  getPublished: () =>
    api.get('/blogs', { params: { limit: 100 } }),

  create: (data: Partial<Blog>) =>
    api.post('/admin/blogs', data),

  update: (id: string, data: Partial<Blog>) =>
    api.patch(`/admin/blogs/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/blogs/${id}`),

  uploadImage: (file: File, blogId: string, onProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('blogId', blogId);

    return new Promise<{ imageUrl: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/admin/content/upload/blog-image`);

      const token = localStorage.getItem('token');
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText);
          resolve({ imageUrl: res.data.imageUrl });
        } else {
          reject(new Error(JSON.parse(xhr.responseText)?.message || 'Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  },

  uploadPdf: (file: File, blogId: string, onProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('blogId', blogId);

    return new Promise<{ pdfUrl: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/admin/content/upload/blog-pdf`);

      const token = localStorage.getItem('token');
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText);
          resolve({ pdfUrl: res.data.pdfUrl });
        } else {
          reject(new Error(JSON.parse(xhr.responseText)?.message || 'Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  },
};

export const categoriesApi = {
  getAll: (params?: { includeInactive?: boolean }) =>
    api.get('/categories', { params }),

  create: (data: Partial<Category>) =>
    api.post('/categories', data),

  update: (id: string, data: Partial<Category>) =>
    api.patch(`/categories/${id}`, data),

  delete: (id: string) =>
    api.delete(`/categories/${id}`),
};

export const distributorApi = {
  getLeads: (params?: Record<string, unknown>) =>
    api.get('/admin/distributor/leads', { params }),

  exportLeads: (params?: Record<string, unknown>) =>
    api.get('/admin/distributor/leads/export', { params, responseType: 'blob' }),

  getLead: (id: string) =>
    api.get(`/admin/distributor/leads/${id}`),

  updateCallStatus: (id: string, leadCallStatus: string) =>
    api.patch(`/admin/distributor/leads/${id}/call-status`, { leadCallStatus }),

  markPaid: (id: string, data: { mode: string; reference?: string; notes?: string }) =>
    api.patch(`/admin/distributor/leads/${id}/mark-paid`, data),

  cancelLead: (id: string) =>
    api.patch(`/admin/distributor/leads/${id}/cancel`, {}),

  approveUtr: (id: string) =>
    api.patch(`/admin/distributor/leads/${id}/approve-utr`, {}),

  rejectUtr: (id: string, reason: string) =>
    api.patch(`/admin/distributor/leads/${id}/reject-utr`, { reason }),

  approveFinalUtr: (id: string) =>
    api.patch(`/admin/distributor/leads/${id}/approve-final-utr`, {}),

  updateIdCreated: (id: string, idCreated: boolean, remark?: string) =>
    api.patch(`/admin/distributor/leads/${id}/id-created`, { idCreated, remark }),

  rejectFinalUtr: (id: string, reason: string) =>
    api.patch(`/admin/distributor/leads/${id}/reject-final-utr`, { reason }),
};

export const usersApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/auth/users', { params }),

  getById: (id: string) => api.get(`/auth/users/${id}`),

  create: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/users', data),

  update: (id: string, data: Partial<{ name: string; email: string; role: string; isActive: boolean; password: string }>) =>
    api.patch(`/auth/users/${id}`, data),

  delete: (id: string) => api.delete(`/auth/users/${id}`),
};

export default api;