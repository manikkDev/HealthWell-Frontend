import React, { useState, useEffect } from 'react';
import './Navbar.css';
import Logo from '../Logo/Logo';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import SignUpModal from '../SignUpModal/SignUpModal';
import SignInModal from '../SignInModal/SignInModal';
import UserProfile from '../UserProfile/UserProfile';
import EditProfileModal from '../EditProfileModal/EditProfileModal';
import { useLanguage } from '../../hooks/useLanguage';
import { useUser } from '../../hooks/useUser';

const Navbar = () => {
  const { t } = useLanguage();
  const { currentUser } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openSignUpModal = () => {
    setIsSignUpModalOpen(true);
    setIsMenuOpen(false); // Close mobile menu if open
  };

  const closeSignUpModal = () => {
    setIsSignUpModalOpen(false);
  };

  const openSignInModal = () => {
    setIsSignInModalOpen(true);
    setIsMenuOpen(false); // Close mobile menu if open
  };

  const closeSignInModal = () => {
    setIsSignInModalOpen(false);
  };

  const openEditProfileModal = () => {
    setIsEditProfileModalOpen(true);
    setIsMenuOpen(false); // Close mobile menu if open
  };

  const closeEditProfileModal = () => {
    setIsEditProfileModalOpen(false);
  };

  const switchToSignIn = () => {
    setIsSignUpModalOpen(false);
    setIsSignInModalOpen(true);
  };

  const switchToSignUp = () => {
    setIsSignInModalOpen(false);
    setIsSignUpModalOpen(true);
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-logo">
          <Logo />
          <span className="navbar-brand">HealthWell</span>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-menu">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a href="#home" className="nav-link active">{t('home')}</a>
            </li>
            <li className="nav-item">
              <a href="#support" className="nav-link">{t('support')}</a>
            </li>
            <li className="nav-item">
              <a href="#about" className="nav-link">{t('about')}</a>
            </li>
          </ul>
        </div>

        {/* Desktop Actions - Theme Toggle & Auth/Profile */}
        <div className="navbar-actions">
          <ThemeToggle />
          {currentUser ? (
            <UserProfile onEditProfile={openEditProfileModal} />
          ) : (
            <div className="navbar-auth">
              <button className="btn btn-outline btn-modern" onClick={openSignInModal}>
                <span className="btn-text">{t('signIn')}</span>
                <div className="btn-shine"></div>
              </button>
              <button className="btn btn-primary btn-modern btn-gradient" onClick={openSignUpModal}>
                <span className="btn-text">{t('getStarted')}</span>
                <div className="btn-shine"></div>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Controls - Theme Toggle & Hamburger */}
        <div className="mobile-controls">
          <ThemeToggle />
          <div className="hamburger" onClick={toggleMenu}>
            <span className={`hamburger-line ${isMenuOpen ? 'active' : ''}`}></span>
            <span className={`hamburger-line ${isMenuOpen ? 'active' : ''}`}></span>
            <span className={`hamburger-line ${isMenuOpen ? 'active' : ''}`}></span>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <ul className="mobile-nav">
          <li><a href="#home" onClick={toggleMenu}>{t('home')}</a></li>
          <li><a href="#support" onClick={toggleMenu}>{t('support')}</a></li>
          <li><a href="#about" onClick={toggleMenu}>{t('about')}</a></li>
          <li className="mobile-theme-toggle">
            <ThemeToggle />
          </li>
          {currentUser ? (
            <li className="mobile-profile">
              <UserProfile onEditProfile={openEditProfileModal} />
            </li>
          ) : (
            <li className="mobile-auth">
              <button className="btn btn-outline btn-modern" onClick={openSignInModal}>
                <span className="btn-text">{t('signIn')}</span>
              </button>
              <button className="btn btn-primary btn-modern btn-gradient" onClick={openSignUpModal}>
                <span className="btn-text">{t('getStarted')}</span>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </li>
          )}
        </ul>
      </div>
      
      </nav>
      
      {/* SignUp Modal - Rendered outside nav to avoid stacking context issues */}
      <SignUpModal isOpen={isSignUpModalOpen} onClose={closeSignUpModal} onSwitchToSignIn={switchToSignIn} />
      
      {/* SignIn Modal */}
      <SignInModal isOpen={isSignInModalOpen} onClose={closeSignInModal} onSwitchToSignUp={switchToSignUp} />
      
      {/* Edit Profile Modal */}
      <EditProfileModal isOpen={isEditProfileModalOpen} onClose={closeEditProfileModal} />
    </>
  );
};

export default Navbar;