import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import './UserProfile.css';

const UserProfile = ({ onEditProfile }) => {
  const { currentUser, logout } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleEditProfile = () => {
    setIsDropdownOpen(false);
    onEditProfile();
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (!currentUser) return null;

  return (
    <div className="user-profile" ref={dropdownRef}>
      <button className="user-avatar" onClick={toggleDropdown}>
        <div className="avatar-circle">
          <span className="avatar-initials">
            {getInitials(currentUser.firstName, currentUser.lastName)}
          </span>
        </div>
        <svg 
          className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <div className="user-info">
              <div className="user-name">
                {currentUser.firstName} {currentUser.lastName}
              </div>
              <div className="user-email">{currentUser.email}</div>
            </div>
          </div>
          
          <div className="dropdown-divider"></div>
          
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={handleEditProfile}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Profile
            </button>
            
            <button className="dropdown-item logout" onClick={handleLogout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
      
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
};

export default UserProfile;