import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import './LanguageDropdown.css';

const LanguageDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLanguage, changeLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectLanguage = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
    console.log('Language changed to:', langCode);
  };

  const selectedLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <div className="language-dropdown">
      <button 
        className={`language-trigger ${isOpen ? 'active' : ''}`}
        onClick={toggleDropdown}
      >
        <span className="language-flag">{selectedLang.flag}</span>
        <span className="language-name">{selectedLang.name}</span>
        <svg 
          className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`} 
          viewBox="0 0 24 24"
        >
          <path d="M7,10L12,15L17,10H7Z" />
        </svg>
      </button>

      <div className={`language-menu ${isOpen ? 'open' : ''}`}>
        <div className="language-menu-content">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`language-option ${currentLanguage === language.code ? 'selected' : ''}`}
              onClick={() => selectLanguage(language.code)}
            >
              <span className="option-flag">{language.flag}</span>
              <span className="option-name">{language.name}</span>
              {currentLanguage === language.code && (
                <svg className="check-icon" viewBox="0 0 24 24">
                  <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {isOpen && <div className="dropdown-overlay" onClick={() => setIsOpen(false)}></div>}
    </div>
  );
};

export default LanguageDropdown;