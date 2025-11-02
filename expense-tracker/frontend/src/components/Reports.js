import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/ApiService';
import './Reports.css';

function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    format: 'csv'
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getReports();
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await ApiService.generateReport(formData);
      setMessage({
        type: 'success',
        text: `Report generated successfully! ${response.data.summary.totalExpenses} expenses, Total: $${response.data.summary.totalAmount}`
      });
      await loadReports();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to generate report'
      });
    } finally {
      setGenerating(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="reports-container">
      <h2>📄 Export Reports</h2>

      <div className="generate-report-card">
        <h3>Generate New Report</h3>
        <form onSubmit={handleGenerate}>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Format</label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="txt">Text</option>
              </select>
            </div>
          </div>

          {message.text && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}

          <button type="submit" className="btn btn-primary" disabled={generating}>
            {generating ? 'Generating...' : '📥 Generate Report'}
          </button>
        </form>
      </div>

      <div className="reports-list-card">
        <h3>Your Reports</h3>
        {loading ? (
          <div className="loading">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="empty-state">
            <p>No reports generated yet</p>
            <small>Generate your first report above!</small>
          </div>
        ) : (
          <div className="reports-list">
            {reports.map((report, index) => (
              <div key={index} className="report-item">
                <div className="report-icon">📄</div>
                <div className="report-details">
                  <div className="report-name">{report.fileName}</div>
                  <div className="report-meta">
                    {formatFileSize(report.size)} • {new Date(report.lastModified).toLocaleDateString()}
                  </div>
                </div>
                <a
                  href={report.downloadUrl}
                  download
                  className="btn btn-download"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ⬇️ Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;
