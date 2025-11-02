import axios from 'axios';
import config from '../config-auth';
import { AuthService } from './AuthService';

const api = axios.create({
  baseURL: config.api.endpoint
});

api.interceptors.request.use(async (config) => {
  const token = await AuthService.getToken();
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export const ApiService = {
  // Expenses
  addExpense: (expense) => api.post('/expenses', expense),
  getExpenses: (params) => api.get('/expenses', { params }),
  updateExpense: (expenseId, updates) => api.put(`/expenses/${expenseId}`, updates),
  deleteExpense: (expenseId) => api.delete(`/expenses/${expenseId}`),

  // Analytics
  getAnalytics: (params) => api.get('/analytics', { params }),

  // Categories
  getCategories: () => api.get('/categories'),
  addCategory: (category) => api.post('/categories', category),

  // Reports
  generateReport: (params) => api.post('/reports/generate', params),
  getReports: () => api.get('/reports')
};
