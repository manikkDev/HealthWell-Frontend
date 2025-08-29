import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import authService from '../../api/authService';
import './SignUpModal.css';

const SignUpModal = ({ isOpen, onClose, onSwitchToSignIn }) => {
  const { login } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Reset form when modal closes
      setTimeout(() => {
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          username: '',
          password: '',
          confirmPassword: ''
        });
        setErrors({});
        setStep(1);
        setIsSuccess(false);
      }, 300);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      }
      case 'firstName':
        if (!value.trim()) {
          newErrors.firstName = 'First name is required';
        } else if (value.trim().length < 2) {
          newErrors.firstName = 'First name must be at least 2 characters';
        } else {
          delete newErrors.firstName;
        }
        break;
      case 'lastName':
        if (!value.trim()) {
          newErrors.lastName = 'Last name is required';
        } else if (value.trim().length < 2) {
          newErrors.lastName = 'Last name must be at least 2 characters';
        } else {
          delete newErrors.lastName;
        }
        break;
      case 'username':
        if (!value.trim()) {
          newErrors.username = 'Username is required';
        } else if (value.trim().length < 3) {
          newErrors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors.username = 'Username can only contain letters, numbers, and underscores';
        } else {
          delete newErrors.username;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        break;
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    setTimeout(() => validateField(name, value), 300);
  };

  const handleNextStep = () => {
    const step1Fields = ['email', 'firstName', 'lastName'];
    let isValid = true;

    step1Fields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    if (isValid) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    let isValid = true;
    Object.keys(formData).forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    if (!isValid) return;

    setIsLoading(true);

    try {
      // Call API to register user
      const response = await authService.signup({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        password: formData.password
      });
      
      // Log in the user
      login(response.user);
      
      setIsSuccess(true);
      
      // Close modal after success animation
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      setErrors({ submit: error.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="signup-modal-overlay" onClick={onClose}>
      <div className="signup-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="signup-modal-card">
          {/* Close Button */}
          <button className="signup-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Header */}
          <div className="signup-header">
            <div className="signup-logo">
              <div className="signup-logo-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2>HealthWell</h2>
            </div>
            <p className="signup-subtitle">
              {step === 1 ? 'Create your account' : 'Set up your credentials'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="signup-progress">
            <div className="progress-bar">
              <div className={`progress-fill ${step === 2 ? 'complete' : ''}`}></div>
            </div>
            <div className="progress-steps">
              <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
              <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
            </div>
          </div>

          {/* Success State */}
          {isSuccess && (
            <div className="signup-success">
              <div className="success-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Welcome to HealthWell!</h3>
              <p>Your account has been created successfully.</p>
            </div>
          )}

          {/* Form */}
          {!isSuccess && (
            <form className="signup-form" onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmit}>
              {step === 1 && (
                <div className="form-step step-1">
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-wrapper">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={errors.email ? 'error' : ''}
                        placeholder="Enter your email"
                      />
                      <div className="input-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                    </div>
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={errors.firstName ? 'error' : ''}
                          placeholder="First name"
                        />
                        <div className="input-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                      </div>
                      {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={errors.lastName ? 'error' : ''}
                          placeholder="Last name"
                        />
                        <div className="input-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                      </div>
                      {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                    </div>
                  </div>

                  <button type="submit" className="signup-btn primary">
                    Continue
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="form-step step-2">
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={errors.username ? 'error' : ''}
                        placeholder="Choose a username"
                      />
                      <div className="input-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                          <path d="M20 8v6M23 11h-6" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                    </div>
                    {errors.username && <span className="error-message">{errors.username}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={errors.password ? 'error' : ''}
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2"/>
                            <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && <span className="error-message">{errors.password}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="input-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={errors.confirmPassword ? 'error' : ''}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2"/>
                            <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                  </div>

                  {errors.submit && (
                    <div className="error-message submit-error">{errors.submit}</div>
                  )}

                  <div className="form-actions">
                    <button type="button" className="signup-btn secondary" onClick={() => setStep(1)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Back
                    </button>
                    <button type="submit" className="signup-btn primary" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="loading-spinner"></div>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* Footer */}
          {!isSuccess && (
            <div className="signup-footer">
              <p>
                Already have an account? 
                <button className="link-btn" onClick={onSwitchToSignIn}>
                  Sign in instead
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;