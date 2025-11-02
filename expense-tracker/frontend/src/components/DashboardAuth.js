import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import Analytics from './Analytics';
import Reports from './Reports';
import { ApiService } from '../services/ApiServiceAuth';

function DashboardAuth({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('expenses');
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesRes, categoriesRes] = await Promise.all([
        ApiService.getExpenses(dateRange),
        ApiService.getCategories()
      ]);
      setExpenses(expensesRes.data.expenses || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expense) => {
    try {
      await ApiService.addExpense(expense);
      await loadData();
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const handleUpdateExpense = async (expenseId, updates) => {
    try {
      await ApiService.updateExpense(expenseId, updates);
      await loadData();
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await ApiService.deleteExpense(expenseId);
      await loadData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>💰 Expense Tracker</h1>
          <div className="user-info">
            <span>Welcome, {user.name || user.email}!</span>
            <button onClick={onLogout} className="btn btn-secondary">Logout</button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          📝 Expenses
        </button>
        <button
          className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button
          className={`nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📄 Reports
        </button>
      </nav>

      <main className="dashboard-main">
        {activeTab === 'expenses' && (
          <div className="expenses-tab">
            <ExpenseForm
              categories={categories}
              onAddExpense={handleAddExpense}
            />
            <ExpenseList
              expenses={expenses}
              categories={categories}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              loading={loading}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <Analytics dateRange={dateRange} onDateRangeChange={setDateRange} />
        )}

        {activeTab === 'reports' && (
          <Reports />
        )}
      </main>
    </div>
  );
}

export default DashboardAuth;
