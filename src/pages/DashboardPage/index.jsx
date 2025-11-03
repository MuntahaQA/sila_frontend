import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { sendRequest } from "../../utilities/sendRequest";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./styles.css";

export default function DashboardPage() {
  const { isAuthenticated, isMinistryUser, user } = useAuth();
  const [ministryStats, setMinistryStats] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    program_id: '',
    status: '',
    date_from: '',
    date_to: '',
  });

  // Get ministry name from user's first_name
  const getMinistryName = () => {
    if (user?.first_name) {
      return user.first_name;
    }
    return 'Ministry';
  };

  const ministryName = getMinistryName();

  const fetchPrograms = async () => {
    try {
      const data = await sendRequest("/api/programs/", "GET", null, true);
      let filteredPrograms = data || [];
      const currentMinistryName = getMinistryName();
      if (currentMinistryName && currentMinistryName !== 'Ministry') {
        filteredPrograms = filteredPrograms.filter(program => 
          program.ministry_owner && 
          program.ministry_owner.toLowerCase().includes(currentMinistryName.toLowerCase())
        );
      }
      setPrograms(filteredPrograms);
    } catch (err) {
      console.error("Error fetching programs:", err);
    }
  };

  const fetchMinistryStats = async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (filters.program_id) params.append('program_id', filters.program_id);
      if (filters.status) params.append('status', filters.status);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const queryString = params.toString();
      const url = `/api/ministry/statistics${queryString ? '?' + queryString : ''}`;
      const data = await sendRequest(url, "GET", null, true);
      setMinistryStats(data);
    } catch (err) {
      console.error("Error fetching ministry stats:", err);
      setError("Failed to load statistics. Please try again.");
    }
  };

  const handleExport = async (exportType = 'summary') => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/ministry/statistics/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...filters,
          export_type: exportType,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ministry_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to export data');
      }
    } catch (err) {
      console.error("Error exporting data:", err);
      setError("Failed to export data. Please try again.");
    }
  };

  useEffect(() => {
    if (isAuthenticated && isMinistryUser) {
      setLoading(true);
      Promise.all([fetchPrograms(), fetchMinistryStats()]).finally(() => {
        setLoading(false);
      });
    }
  }, [isAuthenticated, isMinistryUser]);

  useEffect(() => {
    if (user) {
      fetchMinistryStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, user]);

  if (!isAuthenticated || !isMinistryUser) {
    return (
      <main className="dashboard-page">
        <Navbar />
        <div className="dashboard-page__unauthorized">
          <h2>Access Denied</h2>
          <p>You must be a ministry user to access this dashboard.</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <Navbar />
      
      <section className="dashboard-analytics">
        <div className="container">
          <div className="dashboard-header">
            <div>
              <div className="dashboard-ministry-info">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ministry-icon">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span className="dashboard-ministry-name">{ministryName || 'Ministry'}</span>
              </div>
              <h2 className="title dashboard-title">Ministry Dashboard</h2>
            </div>
            <div className="dashboard-header-actions">
              <button
                className="button button--secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Filters
              </button>
              <button
                className="button button--secondary"
                onClick={() => handleExport('summary')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export Report
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Statistics Section */}
          <div className="dashboard-stats-section">
            {loading ? (
              <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading statistics...</p>
              </div>
            ) : ministryStats ? (
              <div className="stats-cards-grid">
                <div className="stat-card">
                  <div className="stat-card-icon stat-card-icon--programs">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                      <path d="M2 17l10 5 10-5"></path>
                      <path d="M2 12l10 5 10-5"></path>
                    </svg>
                  </div>
                  <div className="stat-card-content">
                    <div className="stat-card-value">{ministryStats.total_programs || 0}</div>
                    <div className="stat-card-label">Total Programs</div>
                    <div className="stat-card-sub-label">
                      {ministryStats.active_programs || 0} Active
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-icon stat-card-icon--beneficiaries">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div className="stat-card-content">
                    <div className="stat-card-value">{ministryStats.unique_beneficiaries || 0}</div>
                    <div className="stat-card-label">Registered Beneficiaries</div>
                    <div className="stat-card-sub-label">
                      Across all programs
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-icon stat-card-icon--applications">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                  </div>
                  <div className="stat-card-content">
                    <div className="stat-card-value">{ministryStats.total_applications || 0}</div>
                    <div className="stat-card-label">Total Applications</div>
                    <div className="stat-card-sub-label">
                      {ministryStats.applications_by_status?.find(s => s.status === 'APPROVED')?.count || 0} Approved
                    </div>
                  </div>
                </div>

                    <div className="stat-card">
                      <div className="stat-card-icon stat-card-icon--approval">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                      <div className="stat-card-content">
                        <div className="stat-card-value">
                          {ministryStats.total_applications > 0
                            ? Math.round(
                                ((ministryStats.applications_by_status?.find(s => s.status === 'APPROVED')?.count || 0) /
                                  ministryStats.total_applications) *
                                  100
                              )
                            : 0}
                          %
                        </div>
                        <div className="stat-card-label">Approval Rate</div>
                        <div className="stat-card-sub-label">
                          {ministryStats.applications_by_status?.find(s => s.status === 'PENDING')?.count || 0} Pending
                        </div>
                      </div>
                    </div>

                    {ministryStats.avg_processing_days !== null && ministryStats.avg_processing_days !== undefined && (
                      <div className="stat-card">
                        <div className="stat-card-icon stat-card-icon--time">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                          </svg>
                        </div>
                        <div className="stat-card-content">
                          <div className="stat-card-value">{ministryStats.avg_processing_days || 0}</div>
                          <div className="stat-card-label">Avg Processing Time</div>
                          <div className="stat-card-sub-label">
                            Days to review
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
              <div className="dashboard-empty">
                <p>No statistics available</p>
              </div>
            )}
          </div>

          {/* Charts Section */}
          {ministryStats && (
            <div className="charts-section">
              <h3 className="dashboard-stats-title">Analytics & Charts</h3>
              <div className="charts-grid">
                {/* Applications by Status Pie Chart */}
                {ministryStats.applications_by_status && ministryStats.applications_by_status.length > 0 ? (
                  <div className="chart-card">
                    <h3 className="chart-title">Applications by Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={ministryStats.applications_by_status.map(item => ({
                            name: item.status || 'Unknown',
                            value: item.count || 0
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {ministryStats.applications_by_status.map((entry, index) => {
                            const colors = ['#4f3aa7', '#6d4fc7', '#b39cff', '#ef4444', '#ff9800'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="chart-card">
                    <h3 className="chart-title">Applications by Status</h3>
                    <div className="chart-empty">
                      <p>No applications data available</p>
                    </div>
                  </div>
                )}

                {/* Applications by Program Bar Chart */}
                {ministryStats.applications_by_program && ministryStats.applications_by_program.length > 0 ? (
                  <div className="chart-card">
                    <h3 className="chart-title">Applications by Program</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart 
                        data={ministryStats.applications_by_program.map(item => ({
                          name: item.program__name || 'Unknown Program',
                          applications: item.count || 0
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="applications" fill="#4f3aa7" name="Applications" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="chart-card">
                    <h3 className="chart-title">Applications by Program</h3>
                    <div className="chart-empty">
                      <p>No applications by program data available</p>
                    </div>
                  </div>
                )}

                {/* Programs Summary Chart */}
                {ministryStats.programs_summary && ministryStats.programs_summary.length > 0 ? (
                  <div className="chart-card chart-card--wide">
                    <h3 className="chart-title">Programs Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={ministryStats.programs_summary}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total_applications" fill="#4f3aa7" name="Applications" />
                        <Bar dataKey="unique_beneficiaries" fill="#b39cff" name="Beneficiaries" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="chart-card chart-card--wide">
                    <h3 className="chart-title">Programs Performance</h3>
                    <div className="chart-empty">
                      <p>No programs performance data available</p>
                    </div>
                  </div>
                )}

                {/* Applications Over Time (Line Chart) */}
                {ministryStats.applications_over_time && ministryStats.applications_over_time.length > 0 ? (
                  <div className="chart-card">
                    <h3 className="chart-title">Applications Trend (Last 30 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={ministryStats.applications_over_time}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                          dataKey="day" 
                          tick={{ fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#4f3aa7" 
                          strokeWidth={2}
                          name="Applications"
                          dot={{ fill: '#4f3aa7', r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="chart-card">
                    <h3 className="chart-title">Applications Trend (Last 30 Days)</h3>
                    <div className="chart-empty">
                      <p>No trend data available</p>
                    </div>
                  </div>
                )}

                {/* Applications by Charity */}
                {ministryStats.applications_by_charity && ministryStats.applications_by_charity.length > 0 ? (
                  <div className="chart-card">
                    <h3 className="chart-title">Top Charities by Applications</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart 
                        data={ministryStats.applications_by_charity.map(item => ({
                          name: item['beneficiary__charity__name'] || 'Unknown',
                          applications: item.count || 0
                        }))}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          tick={{ fontSize: 11 }}
                          width={150}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="applications" fill="#6d4fc7" name="Applications" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="chart-card">
                    <h3 className="chart-title">Top Charities by Applications</h3>
                    <div className="chart-empty">
                      <p>No charity data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Filters Panel */}
          {showFilters && (
            <div className="filters-panel">
              <div className="filters-panel-header">
                <h3>Filter Statistics</h3>
                <button
                  className="button-icon"
                  onClick={() => {
                    setFilters({ program_id: '', status: '', date_from: '', date_to: '' });
                    setShowFilters(false);
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="filters-panel-content">
                <div className="filter-row">
                  <div className="filter-group">
                    <label>Program</label>
                    <select
                      value={filters.program_id}
                      onChange={(e) => setFilters({ ...filters, program_id: e.target.value })}
                    >
                      <option value="">All Programs</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Application Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                      <option value="">All Statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="WITHDRAWN">Withdrawn</option>
                    </select>
                  </div>
                </div>
                <div className="filter-row">
                  <div className="filter-group">
                    <label>Date From</label>
                    <input
                      type="date"
                      value={filters.date_from}
                      onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                    />
                  </div>
                  <div className="filter-group">
                    <label>Date To</label>
                    <input
                      type="date"
                      value={filters.date_to}
                      onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                    />
                  </div>
                </div>
                <div className="filters-panel-actions">
                  <button
                    className="button button--secondary"
                    onClick={() => {
                      setFilters({ program_id: '', status: '', date_from: '', date_to: '' });
                    }}
                  >
                    Clear Filters
                  </button>
                  <button
                    className="button button--primary"
                    onClick={() => setShowFilters(false)}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Additional Statistics */}
          {ministryStats && ministryStats.programs_summary && ministryStats.programs_summary.length > 0 && (
            <div className="programs-summary-section">
              <h3 className="dashboard-stats-title">Programs Breakdown</h3>
              <div className="programs-summary-grid">
                {ministryStats.programs_summary.map((program) => (
                  <div key={program.id} className="program-summary-card">
                    <h4>{program.name}</h4>
                    <div className="program-summary-stats">
                      <div className="summary-stat">
                        <span className="summary-stat-value">{program.total_applications || 0}</span>
                        <span className="summary-stat-label">Applications</span>
                      </div>
                      <div className="summary-stat">
                        <span className="summary-stat-value">{program.unique_beneficiaries || 0}</span>
                        <span className="summary-stat-label">Beneficiaries</span>
                      </div>
                      <div className="summary-stat">
                        <span className={`summary-stat-status summary-stat-status--${program.status.toLowerCase()}`}>
                          {program.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

