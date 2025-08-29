import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import authService from '../../api/authService';
import './SignInModal.css';

const SignInModal = ({ isOpen, onClose, onSwitchToSignUp }) => {
  const { login } = useUser();
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Reset form when modal closes
      setTimeout(() => {
        setFormData({
          usernameOrEmail: '',
          password: ''
        });
        setErrors({});
      }, 300);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Username or email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Call API to authenticate user
      const response = await authService.signin({
        email: formData.usernameOrEmail, // Backend expects email field
        password: formData.password
      });
      
      // Login successful
      login(response.user);
      onClose();
      
    } catch (error) {
      console.error('Sign in error:', error);
      setErrors({ submit: error.message || 'An error occurred during sign in. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (!isOpen) return null;

  return (
    <div className="signin-modal-overlay" onClick={onClose}>
      <div className="signin-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="signin-modal-card">
          {/* Close Button */}
          <button className="signin-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Header */}
          <div className="signin-header">
            <div className="signin-logo">
              <div className="signin-logo-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2>HealthWell</h2>
            </div>
            <p className="signin-subtitle">
              Welcome back! Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="usernameOrEmail">Username or Email</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  value={formData.usernameOrEmail}
                  onChange={handleInputChange}
                  className={errors.usernameOrEmail ? 'error' : ''}
                  placeholder="Enter your username or email"
                />
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
              {errors.usernameOrEmail && <span className="error-message">{errors.usernameOrEmail}</span>}
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
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

            {errors.submit && (
              <div className="error-message submit-error">{errors.submit}</div>
            )}

            <button type="submit" className="signin-btn primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="signin-footer">
            <p>
              Don't have an account? 
              <button className="link-btn" onClick={onSwitchToSignUp}>
                Sign up instead
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;