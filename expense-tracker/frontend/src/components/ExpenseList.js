import React, { useState } from 'react';
import { format } from 'date-fns';
import './ExpenseList.css';

function ExpenseList({ expenses, categories, dateRange, onDateRangeChange, onUpdateExpense, onDeleteExpense, loading }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleEdit = (expense) => {
    setEditingId(expense.expenseId);
    setEditData(expense);
  };

  const handleSave = async (expenseId) => {
    try {
      await onUpdateExpense(expenseId, editData);
      setEditingId(null);
    } catch (error) {
      alert('Failed to update expense');
    }
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await onDeleteExpense(expenseId);
      } catch (error) {
        alert('Failed to delete expense');
      }
    }
  };

  const getCategoryIcon = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.icon : '📝';
  };

  return (
    <div className="expense-list-card">
      <div className="list-header">
        <h2>Expenses</h2>
        <div className="date-range">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => onDateRangeChange({ ...dateRange, startDate: e.target.value })}
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => onDateRangeChange({ ...dateRange, endDate: e.target.value })}
          />
        </div>
      </div>

      <div className="total-summary">
        <span>Total Spending:</span>
        <strong>${total.toFixed(2)}</strong>
      </div>

      {loading ? (
        <div className="loading">Loading expenses...</div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          <p>No expenses found for this period</p>
          <small>Add your first expense to get started!</small>
        </div>
      ) : (
        <div className="expense-items">
          {expenses.map((expense) => (
            <div key={expense.expenseId} className="expense-item">
              {editingId === expense.expenseId ? (
                <div className="edit-mode">
                  <input
                    type="number"
                    value={editData.amount}
                    onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) })}
                    step="0.01"
                  />
                  <input
                    type="text"
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  />
                  <div className="edit-actions">
                    <button onClick={() => handleSave(expense.expenseId)} className="btn-save">Save</button>
                    <button onClick={() => setEditingId(null)} className="btn-cancel">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="expense-icon">{getCategoryIcon(expense.category)}</div>
                  <div className="expense-details">
                    <div className="expense-category">{expense.category}</div>
                    <div className="expense-description">{expense.description || 'No description'}</div>
                    <div className="expense-meta">
                      {format(new Date(expense.date), 'MMM dd, yyyy')} • {expense.paymentMethod}
                    </div>
                  </div>
                  <div className="expense-amount">${expense.amount.toFixed(2)}</div>
                  <div className="expense-actions">
                    <button onClick={() => handleEdit(expense)} className="btn-edit">✏️</button>
                    <button onClick={() => handleDelete(expense.expenseId)} className="btn-delete">🗑️</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExpenseList;
