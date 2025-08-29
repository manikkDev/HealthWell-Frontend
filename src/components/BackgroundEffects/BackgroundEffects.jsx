import React, { useEffect, useState } from 'react';
import './BackgroundEffects.css';

const BackgroundEffects = () => {
  const [bubbles, setBubbles] = useState([]);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate bubbles
    const bubbleArray = [];
    for (let i = 0; i < 15; i++) {
      bubbleArray.push({
        id: i,
        size: Math.random() * 60 + 20, // 20-80px
        left: Math.random() * 100, // 0-100%
        animationDelay: Math.random() * 15, // 0-15s
        animationDuration: Math.random() * 10 + 10, // 10-20s
        color: ['green', 'pink', 'cyan'][Math.floor(Math.random() * 3)]
      });
    }
    setBubbles(bubbleArray);

    // Generate particles
    const particleArray = [];
    for (let i = 0; i < 30; i++) {
      particleArray.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 12,
        animationDuration: Math.random() * 8 + 8, // 8-16s
        color: ['green', 'pink'][Math.floor(Math.random() * 2)]
      });
    }
    setParticles(particleArray);
  }, []);

  return (
    <>
      {/* Bubble Container */}
      <div className="bubble-container">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className={`bubble ${bubble.color}`}
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              animationDelay: `${bubble.animationDelay}s`,
              animationDuration: `${bubble.animationDuration}s`
            }}
          />
        ))}
      </div>

      {/* Particle Container */}
      <div className="particle-container">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`particle ${particle.color}`}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`
            }}
          />
        ))}
      </div>

      {/* Geometric Background Shapes */}
      <div className="geometric-bg">
        <div className="shape shape-1 morphing-shape"></div>
        <div className="shape shape-2 morphing-shape"></div>
        <div className="shape shape-3 morphing-shape"></div>
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Animated Grid Pattern */}
      <div className="grid-pattern"></div>
    </>
  );
};

export default BackgroundEffects;