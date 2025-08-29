import React from 'react';
import './Logo.css';

const Logo = () => {
  return (
    <div className="logo-container">
      <div className="logo-wrapper">
        <svg 
          className="logo-svg" 
          viewBox="0 0 100 100" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="50%" stopColor="#ee5a52" />
              <stop offset="100%" stopColor="#ff8a80" />
            </linearGradient>
            <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ecdc4" />
              <stop offset="100%" stopColor="#44a08d" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Outer Ring */}
          <circle 
            className="logo-ring" 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="url(#pulseGradient)" 
            strokeWidth="2"
          />
          
          {/* Heart Shape */}
          <path 
            className="logo-heart" 
            d="M50,75 C50,75 20,50 20,35 C20,25 30,20 40,25 C45,15 55,15 60,25 C70,20 80,25 80,35 C80,50 50,75 50,75 Z" 
            fill="url(#heartGradient)"
            filter="url(#glow)"
          />
          
          {/* Cross Symbol */}
          <g className="logo-cross">
            <rect x="47" y="35" width="6" height="20" fill="white" rx="3" />
            <rect x="40" y="42" width="20" height="6" fill="white" rx="3" />
          </g>
          
          {/* Pulse Dots */}
          <circle className="pulse-dot pulse-dot-1" cx="25" cy="25" r="2" fill="#4ecdc4" />
          <circle className="pulse-dot pulse-dot-2" cx="75" cy="25" r="2" fill="#4ecdc4" />
          <circle className="pulse-dot pulse-dot-3" cx="25" cy="75" r="2" fill="#4ecdc4" />
          <circle className="pulse-dot pulse-dot-4" cx="75" cy="75" r="2" fill="#4ecdc4" />
        </svg>
        
        {/* Floating Particles */}
        <div className="floating-particles">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
        </div>
      </div>
    </div>
  );
};

export default Logo;