import React, { useState, useEffect } from 'react';
import './App.css';
import ExpenseForm from './components/ExpenseFormNoAuth';
import ExpenseList from './components/ExpenseListNoAuth';
import { ApiService } from './services/ApiServiceNoAuth';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    checkConnection();
    loadExpenses();
  }, []);

  const checkConnection = async () => {
    try {
      await ApiService.testConnection();
      setConnected(true);
    } catch (error) {
      console.error('Connection failed:', error);
      setConnected(false);
    }
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getExpenses();
      setExpenses(response.data.expenses || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expense) => {
    try {
      await ApiService.addExpense(expense);
      await loadExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const handleUpdateExpense = async (expenseId, updates) => {
    try {
      await ApiService.updateExpense(expenseId, updates);
      await loadExpenses();
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await ApiService.deleteExpense(expenseId);
      await loadExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>💰 Expense Tracker</h1>
          <div className="connection-status">
            {connected ? (
              <span className="status-connected">✓ Connected to AWS</span>
            ) : (
              <span className="status-disconnected">✗ Disconnected</span>
            )}
          </div>
        </div>
      </header>

      <div className="dashboard">
        <div className="summary-section">
          <div className="summary-card total">
            <div className="card-icon">💵</div>
            <div className="card-content">
              <div className="card-label">Total Spending</div>
              <div className="card-value">${totalSpending.toFixed(2)}</div>
            </div>
          </div>
          <div className="summary-card count">
            <div className="card-icon">📝</div>
            <div className="card-content">
              <div className="card-label">Total Expenses</div>
              <div className="card-value">{expenses.length}</div>
            </div>
          </div>
          <div className="summary-card average">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <div className="card-label">Average</div>
              <div className="card-value">
                ${expenses.length > 0 ? (totalSpending / expenses.length).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>
        </div>

        {Object.keys(categoryTotals).length > 0 && (
          <div className="category-summary">
            <h3>Spending by Category</h3>
            <div className="category-grid">
              {Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .map(([category, amount]) => (
                  <div key={category} className="category-item">
                    <span className="category-name">{category}</span>
                    <span className="category-amount">${amount.toFixed(2)}</span>
                    <div className="category-bar">
                      <div
                        className="category-bar-fill"
                        style={{ width: `${(amount / totalSpending) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="main-content">
          <ExpenseForm onAddExpense={handleAddExpense} />
          <ExpenseList
            expenses={expenses}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
