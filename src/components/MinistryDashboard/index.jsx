import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { sendRequest } from "../../utilities/sendRequest";
import "./styles.css";

export default function MinistryDashboard() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programStats, setProgramStats] = useState({});
  const [programApplications, setProgramApplications] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [ministryStats, setMinistryStats] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    program_id: '',
    status: '',
    date_from: '',
    date_to: '',
  });

  // Get ministry name from user's first_name (stored during registration)
  // Ministry name is stored in first_name field (e.g., "Ministry of Education")
  const getMinistryName = () => {
    if (user?.first_name) {
      return user.first_name;
    }
    return 'Ministry';
  };

  const ministryName = getMinistryName();

  const [newProgram, setNewProgram] = useState({
    name: "",
    description: "",
    ministry_owner: ministryName || "",
    eligibility_criteria: "",
    application_deadline: "",
    status: "ACTIVE",
  });

  // Update ministry_owner when ministryName changes
  useEffect(() => {
    if (ministryName) {
      setNewProgram(prev => ({ ...prev, ministry_owner: ministryName }));
    }
  }, [ministryName]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await sendRequest("/api/programs/", "GET", null, true);
      
      // Filter programs to show only those belonging to this ministry user
      let filteredPrograms = data || [];
      const currentMinistryName = getMinistryName();
      if (currentMinistryName && currentMinistryName !== 'Ministry') {
        filteredPrograms = filteredPrograms.filter(program => 
          program.ministry_owner && 
          program.ministry_owner.toLowerCase().includes(currentMinistryName.toLowerCase())
        );
      }
      
      setPrograms(filteredPrograms);
      setError(null);
    } catch (err) {
      console.error("Error fetching programs:", err);
      setError("Failed to load programs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchMinistryStats();
  }, []);

  useEffect(() => {
    // Refetch stats when filters change
    if (user) {
      fetchMinistryStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, user]);

  const fetchMinistryStats = async () => {
    try {
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

  // Update programs when ministryName changes (for filtering)
  useEffect(() => {
    if (ministryName && programs.length > 0) {
      const filteredPrograms = programs.filter(program => 
        program.ministry_owner && 
        program.ministry_owner.toLowerCase().includes(ministryName.toLowerCase())
      );
      if (filteredPrograms.length !== programs.length) {
        setPrograms(filteredPrograms);
      }
    }
  }, [ministryName]);

  const fetchProgramStats = async (programId) => {
    try {
      const stats = await sendRequest(
        `/api/programs/${programId}/statistics/`,
        "GET",
        null,
        true
      );
      setProgramStats((prev) => ({ ...prev, [programId]: stats }));
    } catch (err) {
      console.error("Error fetching program stats:", err);
    }
  };

  const fetchProgramApplications = async (programId) => {
    try {
      const applications = await sendRequest(
        `/api/programs/${programId}/applications/`,
        "GET",
        null,
        true
      );
      setProgramApplications((prev) => ({
        ...prev,
        [programId]: applications || [],
      }));
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    try {
      // Ensure ministry_owner is set from current ministry name
      const programData = {
        ...newProgram,
        ministry_owner: ministryName || newProgram.ministry_owner,
      };
      
      const response = await sendRequest(
        "/api/programs/",
        "POST",
        programData,
        true
      );
      
      // Refresh programs list instead of just adding to state
      await fetchPrograms();
      
      setShowCreateForm(false);
      setNewProgram({
        name: "",
        description: "",
        ministry_owner: ministryName || "",
        eligibility_criteria: "",
        application_deadline: "",
        status: "ACTIVE",
      });
      setError(null);
    } catch (err) {
      console.error("Error creating program:", err);
      setError(
        err.error || err.message || "Failed to create program. Please try again."
      );
    }
  };

  const handleViewDetails = async (programId) => {
    if (selectedProgram === programId) {
      setSelectedProgram(null);
      return;
    }
    setSelectedProgram(programId);
    await Promise.all([
      fetchProgramStats(programId),
      fetchProgramApplications(programId),
    ]);
  };

  const handleEditProgram = (program) => {
    setEditingProgram({
      id: program.id,
      name: program.name,
      description: program.description || "",
      ministry_owner: program.ministry_owner || ministryName,
      eligibility_criteria: program.eligibility_criteria || "",
      application_deadline: program.application_deadline || "",
      status: program.status || "ACTIVE",
    });
    setShowCreateForm(false);
  };

  const handleUpdateProgram = async (e) => {
    e.preventDefault();
    try {
      const response = await sendRequest(
        `/api/programs/${editingProgram.id}/`,
        "PATCH",
        editingProgram,
        true
      );
      setPrograms(programs.map(p => p.id === editingProgram.id ? response : p));
      setEditingProgram(null);
      setError(null);
    } catch (err) {
      console.error("Error updating program:", err);
      setError(
        err.error || err.message || "Failed to update program. Please try again."
      );
    }
  };

  const handleDeleteProgram = async (programId) => {
    try {
      await sendRequest(
        `/api/programs/${programId}/`,
        "DELETE",
        null,
        true
      );
      setPrograms(programs.filter(p => p.id !== programId));
      setDeleteConfirm(null);
      setError(null);
    } catch (err) {
      console.error("Error deleting program:", err);
      setError(
        err.error || err.message || "Failed to delete program. Please try again."
      );
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = {
      ACTIVE: "status-active",
      INACTIVE: "status-inactive",
      CLOSED: "status-closed",
    };
    return (
      <span className={`status-badge ${statusClass[status] || ""}`}>
        {status}
      </span>
    );
  };

  const getApplicationStatusBadge = (status) => {
    const statusClass = {
      PENDING: "app-status-pending",
      UNDER_REVIEW: "app-status-review",
      APPROVED: "app-status-approved",
      REJECTED: "app-status-rejected",
      WITHDRAWN: "app-status-withdrawn",
    };
    return (
      <span className={`app-status-badge ${statusClass[status] || ""}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <section className="section ministry-dashboard">
        <div className="container">
          <div className="loading-state">Loading programs...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="section ministry-dashboard">
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
            <p className="dashboard-subtitle">
              Manage your programs and track beneficiary registrations
            </p>
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
            <button
              className="button button--primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              {showCreateForm ? "Cancel" : "Create New Program"}
            </button>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="dashboard-stats-section">
          <h3 className="dashboard-stats-title">Ministry Programs</h3>
          
          {/* Statistics Cards */}
          {ministryStats && (
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
          </div>
          )}
        </div>

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

        {error && <div className="error-message">{error}</div>}

        {editingProgram && (
          <div className="create-program-form">
            <h3>Edit Program</h3>
            <form onSubmit={handleUpdateProgram}>
              <div className="form-group">
                <label>Program Name *</label>
                <input
                  type="text"
                  value={editingProgram.name}
                  onChange={(e) =>
                    setEditingProgram({ ...editingProgram, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Ministry Owner *</label>
                <input
                  type="text"
                  value={editingProgram.ministry_owner}
                  onChange={(e) =>
                    setEditingProgram({ ...editingProgram, ministry_owner: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={editingProgram.description}
                  onChange={(e) =>
                    setEditingProgram({
                      ...editingProgram,
                      description: e.target.value,
                    })
                  }
                  required
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Eligibility Criteria</label>
                <textarea
                  value={editingProgram.eligibility_criteria}
                  onChange={(e) =>
                    setEditingProgram({
                      ...editingProgram,
                      eligibility_criteria: e.target.value,
                    })
                  }
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Application Deadline</label>
                  <input
                    type="date"
                    value={editingProgram.application_deadline || ""}
                    onChange={(e) =>
                      setEditingProgram({
                        ...editingProgram,
                        application_deadline: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={editingProgram.status}
                    onChange={(e) =>
                      setEditingProgram({ ...editingProgram, status: e.target.value })
                    }
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="button button--primary">
                  Update Program
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setEditingProgram(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {showCreateForm && (
          <div className="create-program-form">
            <h3>Create New Program</h3>
            <form onSubmit={handleCreateProgram}>
              <div className="form-group">
                <label>Program Name *</label>
                <input
                  type="text"
                  value={newProgram.name}
                  onChange={(e) =>
                    setNewProgram({ ...newProgram, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Ministry Owner *</label>
                <input
                  type="text"
                  value={newProgram.ministry_owner}
                  disabled
                  className="form-input--disabled"
                  placeholder={ministryName || "Ministry Name"}
                />
                <small className="form-hint">This is automatically set to your ministry name</small>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={newProgram.description}
                  onChange={(e) =>
                    setNewProgram({
                      ...newProgram,
                      description: e.target.value,
                    })
                  }
                  required
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Eligibility Criteria</label>
                <textarea
                  value={newProgram.eligibility_criteria}
                  onChange={(e) =>
                    setNewProgram({
                      ...newProgram,
                      eligibility_criteria: e.target.value,
                    })
                  }
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Application Deadline</label>
                  <input
                    type="date"
                    value={newProgram.application_deadline}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        application_deadline: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={newProgram.status}
                    onChange={(e) =>
                      setNewProgram({ ...newProgram, status: e.target.value })
                    }
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="button button--primary">
                  Create Program
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="programs-grid">
          {programs.length === 0 && !showCreateForm ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <p>No programs yet. Create your first program to get started.</p>
            </div>
          ) : programs.length > 0 ? (
            programs.map((program) => {
              const stats = programStats[program.id];
              const applications = programApplications[program.id] || [];

              return (
                <div key={program.id} className="program-card">
                  <div className="program-card-header">
                    <div>
                      <h3 className="program-name">{program.name}</h3>
                      <p className="program-ministry">{program.ministry_owner}</p>
                    </div>
                    {getStatusBadge(program.status)}
                  </div>

                  <p className="program-description">
                    {program.description || "No description available."}
                  </p>

                  {stats && (
                    <div className="program-stats">
                      <div className="stat-item">
                        <span className="stat-label">Total Applications</span>
                        <span className="stat-value">
                          {stats.total_applications || 0}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Unique Beneficiaries</span>
                        <span className="stat-value">
                          {stats.unique_beneficiaries || 0}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="program-actions">
                    <button
                      className="button button--secondary"
                      onClick={() => handleEditProgram(program)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </button>
                    <button
                      className="button button--danger"
                      onClick={() => setDeleteConfirm(program.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      Delete
                    </button>
                    <button
                      className="button button--secondary"
                      onClick={() => handleViewDetails(program.id)}
                    >
                      {selectedProgram === program.id
                        ? "Hide Details"
                        : "View Beneficiaries"}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d={selectedProgram === program.id ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}></path>
                      </svg>
                    </button>
                  </div>

                  {selectedProgram === program.id && (
                    <div className="program-details">
                      {stats && (
                        <div className="stats-section">
                          <h4>Statistics</h4>
                          <div className="stats-grid">
                            <div className="stat-card">
                              <div className="stat-number">
                                {stats.total_applications || 0}
                              </div>
                              <div className="stat-label">Total Applications</div>
                            </div>
                            <div className="stat-card">
                              <div className="stat-number">
                                {stats.unique_beneficiaries || 0}
                              </div>
                              <div className="stat-label">Unique Beneficiaries</div>
                            </div>
                            {stats.applications_by_status &&
                              stats.applications_by_status.map((statusItem) => (
                                <div key={statusItem.status} className="stat-card">
                                  <div className="stat-number">{statusItem.count}</div>
                                  <div className="stat-label">{statusItem.status}</div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      <div className="beneficiaries-section">
                        <h4>Registered Beneficiaries ({applications.length})</h4>
                        {applications.length === 0 ? (
                          <div className="empty-beneficiaries">
                            No beneficiaries have registered for this program yet.
                          </div>
                        ) : (
                          <div className="beneficiaries-list">
                            {applications.map((app) => (
                              <div key={app.id} className="beneficiary-item">
                                <div className="beneficiary-info">
                                  <div className="beneficiary-name">
                                    {app.beneficiary_name || `Beneficiary #${app.beneficiary || app.id}`}
                                  </div>
                                  <div className="beneficiary-details">
                                    <span>Application ID: {app.id}</span>
                                    {app.application_data && Object.keys(app.application_data).length > 0 && (
                                      <span>Additional Data Available</span>
                                    )}
                                    {app.review_notes && (
                                      <span>Review Notes: {app.review_notes.substring(0, 50)}...</span>
                                    )}
                                  </div>
                                </div>
                                <div className="beneficiary-status">
                                  {getApplicationStatusBadge(app.status)}
                                  <div className="application-date">
                                    Applied: {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : "N/A"}
                                  </div>
                                  {app.reviewed_at && (
                                    <div className="application-date">
                                      Reviewed: {new Date(app.reviewed_at).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : null}
        </div>

        {deleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-dialog">
              <h3>Delete Program</h3>
              <p>
                Are you sure you want to delete this program? This action cannot be undone.
              </p>
              <div className="delete-confirm-actions">
                <button
                  className="button button--danger"
                  onClick={() => handleDeleteProgram(deleteConfirm)}
                >
                  Delete
                </button>
                <button
                  className="button button--secondary"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

