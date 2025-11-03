import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { sendRequest } from "../../utilities/sendRequest";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./styles.css";

export default function ProfilePage() {
  const { user, refreshUser, isMinistryUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileData, setProfileData] = useState({
    ministry_name: "",
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    confirm_password: "",
  });

  // Ensure isMinistryUser is a boolean
  const isMinistry = Boolean(isMinistryUser);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await sendRequest("/api/users/profile/", "GET", null, true);
        if (data) {
          setProfileData({
            ministry_name: isMinistry ? String(data.first_name || "") : "",
            first_name: isMinistry ? "" : String(data.first_name || ""),
            last_name: String(data.last_name || ""),
            email: String(data.email || ""),
            username: String(data.username || ""),
            password: "",
            confirm_password: "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        // Fallback to user data from context
        if (user) {
          setProfileData({
            ministry_name: isMinistry ? String(user.first_name || "") : "",
            first_name: isMinistry ? "" : String(user.first_name || ""),
            last_name: String(user.last_name || ""),
            email: String(user.email || ""),
            username: String(user.username || ""),
            password: "",
            confirm_password: "",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is authenticated
    if (isAuthenticated && user) {
      fetchProfile();
    }
  }, [user, isMinistry, isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear messages when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate password if provided
    if (profileData.password) {
      if (profileData.password.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }
      if (profileData.password !== profileData.confirm_password) {
        setError("Passwords do not match");
        return;
      }
    }

    try {
      setSaving(true);
      const updateData = {
        // For ministry users, ministry_name goes to first_name
        first_name: isMinistry ? profileData.ministry_name : profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
      };

      // Only include password if it's provided
      if (profileData.password) {
        updateData.password = profileData.password;
      }

      const response = await sendRequest(
        "/api/users/profile/",
        "PATCH",
        updateData,
        true
      );

      setSuccess("Profile updated successfully!");
      
      // Clear password fields
      setProfileData((prev) => ({
        ...prev,
        password: "",
        confirm_password: "",
      }));

      // Update user context - refresh user data
      if (response) {
        // Refresh user data from API
        await refreshUser();
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(
        err.error || err.message || "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="profile-page">
      <Navbar />
      
      <section className="profile-page__content">
        <div className="profile-card">
          <div className="profile-page__header">
            <h1 className="profile-page__title">My Profile</h1>
            <p className="profile-page__subtitle">
              Manage your account information and settings
            </p>
          </div>

          {loading ? (
            <div className="profile-loading">
              <div className="loading-spinner"></div>
              <p>Loading profile...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="profile-message profile-message--error">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {error}
                </div>
              )}

            {success && (
              <div className="profile-message profile-message--success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-section">
                {isMinistry ? (
                  <>
                    <div className="form-group">
                      <label htmlFor="ministry_name">
                        Ministry Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="ministry_name"
                        name="ministry_name"
                        value={profileData.ministry_name}
                        onChange={handleChange}
                        required
                        placeholder="Enter ministry name"
                        className={error && !profileData.ministry_name ? 'error' : ''}
                      />
                      {error && !profileData.ministry_name && (
                        <span className="error-text">Ministry name is required</span>
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="email">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleChange}
                          required
                          placeholder="Enter your email address"
                          className={error && !profileData.email ? 'error' : ''}
                        />
                        {error && !profileData.email && (
                          <span className="error-text">Email is required</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={profileData.username}
                          disabled
                          className="form-input--disabled"
                          placeholder="Username (cannot be changed)"
                        />
                        <small className="form-hint">Username cannot be changed</small>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="first_name">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="first_name"
                          name="first_name"
                          value={profileData.first_name}
                          onChange={handleChange}
                          required
                          placeholder="Enter your first name"
                          className={error && !profileData.first_name ? 'error' : ''}
                        />
                        {error && !profileData.first_name && (
                          <span className="error-text">First name is required</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="last_name">Last Name</label>
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          value={profileData.last_name}
                          onChange={handleChange}
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="email">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleChange}
                          required
                          placeholder="Enter your email address"
                          className={error && !profileData.email ? 'error' : ''}
                        />
                        {error && !profileData.email && (
                          <span className="error-text">Email is required</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={profileData.username}
                          disabled
                          className="form-input--disabled"
                          placeholder="Username (cannot be changed)"
                        />
                        <small className="form-hint">Username cannot be changed</small>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="form-section">
                <h3 className="form-section__title">Change Password</h3>
                <p className="form-section__description">
                  Leave blank if you don't want to change your password
                </p>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">New Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={profileData.password}
                      onChange={handleChange}
                      placeholder="Enter new password (min. 8 characters)"
                      minLength={8}
                      className={error && profileData.password && profileData.password.length < 8 ? 'error' : ''}
                    />
                    {error && profileData.password && profileData.password.length < 8 && (
                      <span className="error-text">Password must be at least 8 characters</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirm_password">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirm_password"
                      name="confirm_password"
                      value={profileData.confirm_password}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      minLength={8}
                      className={error && profileData.password !== profileData.confirm_password && profileData.confirm_password ? 'error' : ''}
                    />
                    {error && profileData.password !== profileData.confirm_password && profileData.confirm_password && (
                      <span className="error-text">Passwords do not match</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="button button--primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => {
                    setProfileData({
                      ministry_name: isMinistry ? String(user?.first_name || "") : "",
                      first_name: isMinistry ? "" : String(user?.first_name || ""),
                      last_name: String(user?.last_name || ""),
                      email: String(user?.email || ""),
                      username: String(user?.username || ""),
                      password: "",
                      confirm_password: "",
                    });
                    setError(null);
                    setSuccess(null);
                  }}
                >
                  Reset
                </button>
              </div>
            </form>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

