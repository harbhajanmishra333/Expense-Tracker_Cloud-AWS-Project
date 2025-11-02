import React, { useState } from 'react';
import { format } from 'date-fns';
import './ExpenseList.css';

const categoryIcons = {
  'Food & Dining': '🍔',
  'Transportation': '🚗',
  'Shopping': '🛍️',
  'Entertainment': '🎬',
  'Bills & Utilities': '💡',
  'Healthcare': '🏥',
  'Education': '📚',
  'Travel': '✈️',
  'Groceries': '🛒',
  'Other': '📝'
};

function ExpenseList({ expenses, onUpdateExpense, onDeleteExpense, loading }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEdit = (expense) => {
    setEditingId(expense.expenseId);
    setEditData(expense);
  };

  const handleSave = async (expenseId) => {
    try {
      await onUpdateExpense(expenseId, {
        amount: editData.amount,
        description: editData.description,
        category: editData.category,
        date: editData.date,
        paymentMethod: editData.paymentMethod
      });
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
    return categoryIcons[categoryName] || '📝';
  };

  return (
    <div className="expense-list-card">
      <h2>📋 Your Expenses</h2>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading expenses...</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No expenses yet</p>
          <small>Add your first expense to get started!</small>
        </div>
      ) : (
        <div className="expense-items">
          {expenses.map((expense) => (
            <div key={expense.expenseId} className="expense-item">
              {editingId === expense.expenseId ? (
                <div className="edit-mode">
                  <div className="edit-row">
                    <input
                      type="number"
                      value={editData.amount}
                      onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) })}
                      step="0.01"
                      placeholder="Amount"
                    />
                    <input
                      type="text"
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      placeholder="Description"
                    />
                  </div>
                  <div className="edit-actions">
                    <button onClick={() => handleSave(expense.expenseId)} className="btn-save">
                      ✓ Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-cancel">
                      ✗ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="expense-icon">{getCategoryIcon(expense.category)}</div>
                  <div className="expense-details">
                    <div className="expense-category">{expense.category}</div>
                    <div className="expense-description">
                      {expense.description || 'No description'}
                    </div>
                    <div className="expense-meta">
                      📅 {format(new Date(expense.date), 'MMM dd, yyyy')} • 
                      {expense.paymentMethod === 'cash' && ' 💵'}
                      {expense.paymentMethod === 'credit' && ' 💳'}
                      {expense.paymentMethod === 'debit' && ' 💳'}
                      {expense.paymentMethod === 'online' && ' 🌐'}
                      {' '}{expense.paymentMethod}
                    </div>
                  </div>
                  <div className="expense-amount">${expense.amount.toFixed(2)}</div>
                  <div className="expense-actions">
                    <button 
                      onClick={() => handleEdit(expense)} 
                      className="btn-edit"
                      title="Edit expense"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(expense.expenseId)} 
                      className="btn-delete"
                      title="Delete expense"
                    >
                      🗑️
                    </button>
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
