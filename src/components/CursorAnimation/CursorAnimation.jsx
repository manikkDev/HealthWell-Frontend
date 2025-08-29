import React, { useEffect, useRef, useState } from 'react';
import './CursorAnimation.css';

const CursorAnimation = () => {
  const cursorRef = useRef(null);

  const animationRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    const trailLength = 8;
    const trails = [];

    // Initialize trail positions
    for (let i = 0; i < trailLength; i++) {
      trails.push({ x: 0, y: 0, opacity: 0 });
    }

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const animate = () => {
      // Smooth cursor following with easing
      const ease = 0.15;
      cursorX += (mouseX - cursorX) * ease;
      cursorY += (mouseY - cursorY) * ease;

      // Update main cursor position
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorX - 12}px, ${cursorY - 12}px, 0)`;
      }

      // Update trail positions with delay
      for (let i = trailLength - 1; i > 0; i--) {
        trails[i].x = trails[i - 1].x;
        trails[i].y = trails[i - 1].y;
        trails[i].opacity = (trailLength - i) / trailLength * 0.6;
      }
      trails[0].x = cursorX;
      trails[0].y = cursorY;
      trails[0].opacity = 0.8;

      // Update trail elements
      trails.forEach((trail, index) => {
        const trailElement = document.querySelector(`.cursor-trail-${index}`);
        if (trailElement) {
          trailElement.style.transform = `translate3d(${trail.x - 6}px, ${trail.y - 6}px, 0)`;
          trailElement.style.opacity = trail.opacity;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Start animation
    animate();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Main cursor */}
      <div
        ref={cursorRef}
        className={`custom-cursor ${isVisible ? 'visible' : ''} ${isClicking ? 'clicking' : ''}`}
      >
        <div className="cursor-inner"></div>
        <div className="cursor-glow"></div>
      </div>

      {/* Trail elements */}
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className={`cursor-trail cursor-trail-${index} ${isVisible ? 'visible' : ''}`}
        >
          <div className="trail-dot"></div>
        </div>
      ))}
    </>
  );
};

export default CursorAnimation;