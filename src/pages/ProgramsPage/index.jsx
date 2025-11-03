import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { sendRequest } from "../../utilities/sendRequest";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./styles.css";

// Map program names to icons
const getProgramIcon = (name) => {
  const iconMap = {
    'ضمان': (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
    'سكني': (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ),
    'غذاء': (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
      </svg>
    ),
    'تمويل': (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    ),
    'ترميم': (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
        <path d="M12 6v4"></path>
        <path d="M10 8h4"></path>
      </svg>
    ),
  };

  // Check for keywords in program name
  for (const [keyword, icon] of Object.entries(iconMap)) {
    if (name.includes(keyword)) {
      return icon;
    }
  }

  // Default icon
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
      <path d="M2 17l10 5 10-5"></path>
      <path d="M2 12l10 5 10-5"></path>
    </svg>
  );
};

export default function ProgramsPage() {
  const { isAuthenticated, isMinistryUser, user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Get ministry name from user
  const getMinistryName = () => {
    if (user?.first_name) {
      return user.first_name;
    }
    if (user?.email) {
      const emailDomain = user.email.split('@')[1];
      if (emailDomain) {
        return emailDomain.split('.')[0].charAt(0).toUpperCase() + emailDomain.split('.')[0].slice(1);
      }
    }
    return '';
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

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch programs (authenticated requests will filter by ministry for ministry users)
        const data = await sendRequest('/api/programs/', 'GET', null, isAuthenticated);
        
        // Handle paginated response or array response
        let programsList = [];
        if (data && data.results) {
          programsList = data.results;
        } else if (Array.isArray(data)) {
          programsList = data;
        }
        
        // For ministry users, filter to show only their programs
        if (isMinistryUser && ministryName) {
          programsList = programsList.filter(program => 
            program.ministry_owner && 
            program.ministry_owner.toLowerCase().includes(ministryName.toLowerCase())
          );
        }
        
        setPrograms(programsList);
      } catch (err) {
        console.error('Error fetching programs:', err);
        const errorMessage = err.message || err.error || 'Failed to load programs. Please try again later.';
        setError(errorMessage);
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [isAuthenticated, isMinistryUser, ministryName]);

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    try {
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
      await fetchPrograms();
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
      await fetchPrograms();
      setDeleteConfirm(null);
      setError(null);
    } catch (err) {
      console.error("Error deleting program:", err);
      setError(
        err.error || err.message || "Failed to delete program. Please try again."
      );
    }
  };

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await sendRequest('/api/programs/', 'GET', null, isAuthenticated);
      
      let programsList = [];
      if (data && data.results) {
        programsList = data.results;
      } else if (Array.isArray(data)) {
        programsList = data;
      }
      
      if (isMinistryUser && ministryName) {
        programsList = programsList.filter(program => 
          program.ministry_owner && 
          program.ministry_owner.toLowerCase().includes(ministryName.toLowerCase())
        );
      } else if (!isMinistryUser) {
        programsList = programsList.filter(p => p.status === 'ACTIVE');
      }
      
      setPrograms(programsList);
    } catch (err) {
      console.error('Error fetching programs:', err);
      const errorMessage = err.message || err.error || 'Failed to load programs. Please try again later.';
      setError(errorMessage);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="programs-page">
      <Navbar />
      
          <section className="programs-page__content">
            <div className="container">
              <div className="dashboard-header">
                <div>
                  {isMinistryUser && (
                    <div className="dashboard-ministry-info">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ministry-icon">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                      <span className="dashboard-ministry-name">{ministryName || 'Ministry'}</span>
                    </div>
                  )}
                  <h2 className="title dashboard-title">
                    {isMinistryUser ? 'My Programs' : 'Available Support Programs'}
                  </h2>
                  {!isMinistryUser && (
                    <p className="dashboard-subtitle">
                      Explore government programs designed to support families and individuals in need.
                    </p>
                  )}
                </div>
                {isMinistryUser && (
                  <div className="dashboard-header-actions">
                    <button
                      className="button button--primary"
                      onClick={() => {
                        setShowCreateForm(!showCreateForm);
                        setEditingProgram(null);
                      }}
                    >
                      {showCreateForm ? (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                          Cancel
                        </>
                      ) : (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14"></path>
                        </svg>
                        Create New Program
                      </>
                    )}
                    </button>
                  </div>
                )}
              </div>

          {error && (
            <div className="programs-page__error" style={{ marginBottom: '1.5rem' }}>
              <p>{error}</p>
            </div>
          )}

          {/* Create/Edit Program Form */}
          {(showCreateForm || editingProgram) && (
            <div className="program-form-card">
              <h3>{editingProgram ? 'Edit Program' : 'Create New Program'}</h3>
              <form onSubmit={editingProgram ? handleUpdateProgram : handleCreateProgram}>
                <div className="form-group">
                  <label>Program Name *</label>
                  <input
                    type="text"
                    value={editingProgram ? editingProgram.name : newProgram.name}
                    onChange={(e) =>
                      editingProgram
                        ? setEditingProgram({ ...editingProgram, name: e.target.value })
                        : setNewProgram({ ...newProgram, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ministry Owner *</label>
                  <input
                    type="text"
                    value={editingProgram ? editingProgram.ministry_owner : newProgram.ministry_owner}
                    disabled
                    className="form-input--disabled"
                    placeholder={ministryName || "Ministry Name"}
                  />
                  <small className="form-hint">This is automatically set to your ministry name</small>
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={editingProgram ? editingProgram.description : newProgram.description}
                    onChange={(e) =>
                      editingProgram
                        ? setEditingProgram({ ...editingProgram, description: e.target.value })
                        : setNewProgram({ ...newProgram, description: e.target.value })
                    }
                    required
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label>Eligibility Criteria</label>
                  <textarea
                    value={editingProgram ? editingProgram.eligibility_criteria : newProgram.eligibility_criteria}
                    onChange={(e) =>
                      editingProgram
                        ? setEditingProgram({ ...editingProgram, eligibility_criteria: e.target.value })
                        : setNewProgram({ ...newProgram, eligibility_criteria: e.target.value })
                    }
                    rows="3"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Application Deadline</label>
                    <input
                      type="date"
                      value={editingProgram ? (editingProgram.application_deadline || "") : newProgram.application_deadline}
                      onChange={(e) =>
                        editingProgram
                          ? setEditingProgram({ ...editingProgram, application_deadline: e.target.value })
                          : setNewProgram({ ...newProgram, application_deadline: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Status *</label>
                    <select
                      value={editingProgram ? editingProgram.status : newProgram.status}
                      onChange={(e) =>
                        editingProgram
                          ? setEditingProgram({ ...editingProgram, status: e.target.value })
                          : setNewProgram({ ...newProgram, status: e.target.value })
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
                    {editingProgram ? "Update Program" : "Create Program"}
                  </button>
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingProgram(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading && (
            <div className="programs-page__loading">
              <div className="loading-spinner"></div>
              <p>Loading programs...</p>
            </div>
          )}

          {error && (
            <div className="programs-page__error">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && programs.length === 0 && !showCreateForm && !editingProgram && (
            <div className="programs-page__empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
              <h3>No Programs Available</h3>
              <p>There are currently no programs available. Please check back later.</p>
            </div>
          )}

          {!loading && !error && programs.length > 0 && (
            <div className="grid programs-page__grid">
                {programs.map((program) => (
                  <article key={program.id} className="card programs-page__card">
                    <div className="programs-page__icon-wrapper">
                      <div className="programs-page__icon">
                        {getProgramIcon(program.name)}
                      </div>
                    </div>
                    
                    <div className="programs-page__card-header">
                      <h3 className="programs-page__card-title">{program.name}</h3>
                      <span className={`programs-page__status programs-page__status--${program.status.toLowerCase()}`}>
                        {program.status}
                      </span>
                    </div>
                    
                    <p className="programs-page__ministry">{program.ministry_owner}</p>
                    
                    <p className="programs-page__description">{program.description}</p>
                    
                    {program.application_count !== undefined && (
                      <div className="programs-page__applications">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span>{program.application_count} applications</span>
                      </div>
                    )}
                  </article>
                ))}
            </div>
          )}

          {/* Delete Confirmation Dialog */}
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

      <Footer />
    </main>
  );
}

