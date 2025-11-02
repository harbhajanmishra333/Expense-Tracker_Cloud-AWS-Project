import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ApiService } from '../services/ApiService';
import './Analytics.css';

const COLORS = ['#667eea', '#764ba2', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#FFFFD2', '#A8D8EA'];

function Analytics({ dateRange, onDateRangeChange }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAnalytics(dateRange);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="error">Failed to load analytics</div>;
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>📊 Spending Analytics</h2>
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

      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-label">Total Spending</div>
            <div className="card-value">${analytics.summary.totalSpending.toFixed(2)}</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">📝</div>
          <div className="card-content">
            <div className="card-label">Transactions</div>
            <div className="card-value">{analytics.summary.totalTransactions}</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <div className="card-label">Daily Average</div>
            <div className="card-value">${analytics.summary.averageDaily.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.byCategory}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.category}: $${entry.amount}`}
              >
                {analytics.byCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Top Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.topCategories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h3>Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.byMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#667eea" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Payment Methods</h3>
          <div className="payment-methods">
            {analytics.byPaymentMethod.map((method, index) => (
              <div key={index} className="payment-item">
                <span className="payment-name">{method.method}</span>
                <span className="payment-amount">${method.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Category Breakdown</h3>
          <div className="category-breakdown">
            {analytics.byCategory.map((cat, index) => (
              <div key={index} className="category-item">
                <div className="category-info">
                  <span className="category-name">{cat.category}</span>
                  <span className="category-percentage">{cat.percentage}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${cat.percentage}%`,
                      background: COLORS[index % COLORS.length]
                    }}
                  />
                </div>
                <span className="category-amount">${cat.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
