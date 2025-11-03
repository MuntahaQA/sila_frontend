import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // قراءة نوع المستخدم من URL query parameter
  const urlType = searchParams.get('type');
  const initialUserType = (urlType === 'charity' || urlType === 'ministry') ? urlType : 'charity';
  
  const [userType, setUserType] = useState(initialUserType);

  // تحديث userType عند تغيير query parameter
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'charity' || type === 'ministry') {
      setUserType(type);
    }
  }, [searchParams]);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  
  // Charity form state
  const [charityForm, setCharityForm] = useState({
    organization_name: '',
    registration_number: '',
    issuing_authority: '',
    charity_type: 'HEALTH',
    custom_charity_type: '', // للأنواع المخصصة
    email: '',
    phone: '',
    address: '',
    admin_name: '',
    password: '',
    confirmPassword: '',
    license_certificate: null,
    admin_id_document: null,
  });

  // Ministry form state
  const [ministryForm, setMinistryForm] = useState({
    ministry_name: '',
    ministry_email: '',
    contact_number: '',
    ministry_code: '',
    responsible_person_name: '',
    position: '',
    password: '',
    confirmPassword: '',
    authorization_document: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const showAlertMessage = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => setShowAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleCharityChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setCharityForm(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setCharityForm(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleMinistryChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setMinistryForm(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setMinistryForm(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateCharityForm = () => {
    const newErrors = {};
    if (!charityForm.organization_name.trim()) newErrors.organization_name = 'Organization name is required';
    if (!charityForm.registration_number.trim()) newErrors.registration_number = 'Registration number is required';
    if (!charityForm.issuing_authority.trim()) newErrors.issuing_authority = 'Issuing authority is required';
    if (!charityForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(charityForm.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!charityForm.phone.trim()) newErrors.phone = 'Phone is required';
    if (!charityForm.address.trim()) newErrors.address = 'Address is required';
    if (!charityForm.admin_name.trim()) newErrors.admin_name = 'Admin name is required';
    if (charityForm.charity_type === 'OTHER' && !charityForm.custom_charity_type.trim()) {
      newErrors.custom_charity_type = 'Please specify the charity type';
    }
    if (!charityForm.password) {
      newErrors.password = 'Password is required';
    } else if (charityForm.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (charityForm.password !== charityForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!charityForm.license_certificate) newErrors.license_certificate = 'License certificate is required';
    if (!charityForm.admin_id_document) newErrors.admin_id_document = 'Admin ID document is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMinistryForm = () => {
    const newErrors = {};
    if (!ministryForm.ministry_name.trim()) newErrors.ministry_name = 'Ministry name is required';
    if (!ministryForm.ministry_email.trim()) {
      newErrors.ministry_email = 'Ministry email is required';
    } else if (!/\S+@\S+\.\S+/.test(ministryForm.ministry_email)) {
      newErrors.ministry_email = 'Email is invalid';
    }
    if (!ministryForm.contact_number.trim()) newErrors.contact_number = 'Contact number is required';
    if (!ministryForm.ministry_code.trim()) newErrors.ministry_code = 'Ministry code is required';
    if (!ministryForm.responsible_person_name.trim()) newErrors.responsible_person_name = 'Responsible person name is required';
    if (!ministryForm.position.trim()) newErrors.position = 'Position/Role is required';
    if (!ministryForm.password) {
      newErrors.password = 'Password is required';
    } else if (ministryForm.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (ministryForm.password !== ministryForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!ministryForm.authorization_document) newErrors.authorization_document = 'Authorization document is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCharitySubmit = async (e) => {
    e.preventDefault();
    if (!validateCharityForm()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('organization_name', charityForm.organization_name);
      formData.append('registration_number', charityForm.registration_number);
      formData.append('issuing_authority', charityForm.issuing_authority);
      // إرسال النوع المخصص إذا كان Other
      if (charityForm.charity_type === 'OTHER' && charityForm.custom_charity_type.trim()) {
        formData.append('charity_type', charityForm.custom_charity_type);
      } else {
        formData.append('charity_type', charityForm.charity_type);
      }
      formData.append('email', charityForm.email);
      formData.append('phone', charityForm.phone);
      formData.append('address', charityForm.address);
      formData.append('admin_name', charityForm.admin_name);
      formData.append('password', charityForm.password);
      formData.append('license_certificate', charityForm.license_certificate);
      formData.append('admin_id_document', charityForm.admin_id_document);

      const response = await fetch(`${API_URL}/api/charities/register/`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showAlertMessage('success', data.message || 'Registration successful! Your account is pending approval.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const errorMessages = Object.values(data).flat().join(', ');
        showAlertMessage('error', errorMessages || 'Registration failed. Please try again.');
        setErrors(data);
      }
    } catch (error) {
      showAlertMessage('error', 'Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMinistrySubmit = async (e) => {
    e.preventDefault();
    if (!validateMinistryForm()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('ministry_name', ministryForm.ministry_name);
      formData.append('ministry_email', ministryForm.ministry_email);
      formData.append('contact_number', ministryForm.contact_number);
      formData.append('ministry_code', ministryForm.ministry_code);
      formData.append('responsible_person_name', ministryForm.responsible_person_name);
      formData.append('position', ministryForm.position);
      formData.append('password', ministryForm.password);
      formData.append('authorization_document', ministryForm.authorization_document);

      const response = await fetch(`${API_URL}/api/ministries/register/`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showAlertMessage('success', data.message || 'Registration successful!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const errorMessages = Object.values(data).flat().join(', ');
        showAlertMessage('error', errorMessages || 'Registration failed. Please try again.');
        setErrors(data);
      }
    } catch (error) {
      showAlertMessage('error', 'Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-page">
      <Navbar />
      
      {/* Alert */}
      {showAlert.show && (
        <div className={`alert ${showAlert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {showAlert.message}
        </div>
      )}

      <div className="signup-container">
        <div className="signup-card">
          <h1>Create an Account</h1>
          <p className="signup-subtitle">Join SILA to start making a difference</p>

          {/* App Bar - User Type Selection */}
          <div className="user-type-selector">
            <button
              type="button"
              className={`type-btn ${userType === 'charity' ? 'active' : ''}`}
              onClick={() => setUserType('charity')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Charity
            </button>
            <button
              type="button"
              className={`type-btn ${userType === 'ministry' ? 'active' : ''}`}
              onClick={() => setUserType('ministry')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
              Ministry
            </button>
          </div>

          {/* Charity Form */}
          {userType === 'charity' && (
            <form onSubmit={handleCharitySubmit} className="signup-form">
              <div className="form-section">
                <div className="form-group">
                  <label>
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="organization_name"
                    value={charityForm.organization_name}
                    onChange={handleCharityChange}
                    className={errors.organization_name ? 'error' : ''}
                  />
                  {errors.organization_name && (
                    <span className="error-text">{errors.organization_name}</span>
                  )}
                </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Registration Number / License ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="registration_number"
                    value={charityForm.registration_number}
                    onChange={handleCharityChange}
                    className={errors.registration_number ? 'error' : ''}
                  />
                  {errors.registration_number && (
                    <span className="error-text">{errors.registration_number}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Issuing Authority <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="issuing_authority"
                    value={charityForm.issuing_authority}
                    onChange={handleCharityChange}
                    className={errors.issuing_authority ? 'error' : ''}
                  />
                  {errors.issuing_authority && (
                    <span className="error-text">{errors.issuing_authority}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>
                  Charity Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="charity_type"
                  value={charityForm.charity_type}
                  onChange={handleCharityChange}
                  className={errors.charity_type ? 'error' : ''}
                >
                  <option value="HEALTH">Health</option>
                  <option value="EDUCATION">Education</option>
                  <option value="HOUSING">Housing</option>
                  <option value="FOOD">Food & Nutrition</option>
                  <option value="SOCIAL">Social Services</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.charity_type && (
                  <span className="error-text">{errors.charity_type}</span>
                )}
              </div>

              {charityForm.charity_type === 'OTHER' && (
                <div className="form-group">
                  <label>
                    Specify Charity Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="custom_charity_type"
                    value={charityForm.custom_charity_type}
                    onChange={handleCharityChange}
                    placeholder="Enter charity type..."
                    className={errors.custom_charity_type ? 'error' : ''}
                  />
                  {errors.custom_charity_type && (
                    <span className="error-text">{errors.custom_charity_type}</span>
                  )}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={charityForm.email}
                    onChange={handleCharityChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && (
                    <span className="error-text">{errors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={charityForm.phone}
                    onChange={handleCharityChange}
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && (
                    <span className="error-text">{errors.phone}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={charityForm.address}
                  onChange={handleCharityChange}
                  rows="3"
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && (
                  <span className="error-text">{errors.address}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  Admin Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="admin_name"
                  value={charityForm.admin_name}
                  onChange={handleCharityChange}
                  className={errors.admin_name ? 'error' : ''}
                />
                {errors.admin_name && (
                  <span className="error-text">{errors.admin_name}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={charityForm.password}
                    onChange={handleCharityChange}
                    className={errors.password ? 'error' : ''}
                  />
                  {errors.password && (
                    <span className="error-text">{errors.password}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={charityForm.confirmPassword}
                    onChange={handleCharityChange}
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  {errors.confirmPassword && (
                    <span className="error-text">{errors.confirmPassword}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    License Certificate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    name="license_certificate"
                    onChange={handleCharityChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className={errors.license_certificate ? 'error' : ''}
                  />
                  {errors.license_certificate && (
                    <span className="error-text">{errors.license_certificate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Admin ID Document <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    name="admin_id_document"
                    onChange={handleCharityChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className={errors.admin_id_document ? 'error' : ''}
                  />
                  {errors.admin_id_document && (
                    <span className="error-text">{errors.admin_id_document}</span>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? 'Creating Account...' : 'Register Charity'}
                </button>
              </div>
              </div>
            </form>
          )}

          {/* Ministry Form */}
          {userType === 'ministry' && (
            <form onSubmit={handleMinistrySubmit} className="signup-form">
              <div className="form-section">
                <div className="form-group">
                  <label>
                    Ministry Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ministry_name"
                    value={ministryForm.ministry_name}
                    onChange={handleMinistryChange}
                    className={errors.ministry_name ? 'error' : ''}
                  />
                  {errors.ministry_name && (
                    <span className="error-text">{errors.ministry_name}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Ministry Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="ministry_email"
                      value={ministryForm.ministry_email}
                      onChange={handleMinistryChange}
                      className={errors.ministry_email ? 'error' : ''}
                    />
                    {errors.ministry_email && (
                      <span className="error-text">{errors.ministry_email}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contact_number"
                      value={ministryForm.contact_number}
                      onChange={handleMinistryChange}
                      className={errors.contact_number ? 'error' : ''}
                    />
                    {errors.contact_number && (
                      <span className="error-text">{errors.contact_number}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Ministry Code / ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ministry_code"
                    value={ministryForm.ministry_code}
                    onChange={handleMinistryChange}
                    className={errors.ministry_code ? 'error' : ''}
                  />
                  {errors.ministry_code && (
                    <span className="error-text">{errors.ministry_code}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Responsible Person Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="responsible_person_name"
                      value={ministryForm.responsible_person_name}
                      onChange={handleMinistryChange}
                      className={errors.responsible_person_name ? 'error' : ''}
                    />
                    {errors.responsible_person_name && (
                      <span className="error-text">{errors.responsible_person_name}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      Position / Role <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={ministryForm.position}
                      onChange={handleMinistryChange}
                      className={errors.position ? 'error' : ''}
                    />
                    {errors.position && (
                      <span className="error-text">{errors.position}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={ministryForm.password}
                      onChange={handleMinistryChange}
                      className={errors.password ? 'error' : ''}
                    />
                    {errors.password && (
                      <span className="error-text">{errors.password}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={ministryForm.confirmPassword}
                      onChange={handleMinistryChange}
                      className={errors.confirmPassword ? 'error' : ''}
                    />
                    {errors.confirmPassword && (
                      <span className="error-text">{errors.confirmPassword}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Official Authorization Document <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    name="authorization_document"
                    onChange={handleMinistryChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className={errors.authorization_document ? 'error' : ''}
                  />
                  {errors.authorization_document && (
                    <span className="error-text">{errors.authorization_document}</span>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={loading}
                    className="submit-btn"
                  >
                    {loading ? 'Creating Account...' : 'Register Ministry'}
                  </button>
                </div>
              </div>
            </form>
          )}

          <p className="login-link">
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
