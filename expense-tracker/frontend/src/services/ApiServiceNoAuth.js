import axios from 'axios';
import config from '../config-noauth';

const api = axios.create({
  baseURL: config.api.endpoint
});

export const ApiService = {
  // Expenses (No Auth)
  addExpense: (expense) => api.post('/expenses-test', expense),
  getExpenses: () => api.get('/expenses-test'),
  updateExpense: (expenseId, updates) => api.put(`/expenses-test/${expenseId}`, updates),
  deleteExpense: (expenseId) => api.delete(`/expenses-test/${expenseId}`),
  
  // Test endpoint
  testConnection: () => api.get('/test')
};
