import React, { useEffect, useState } from 'react';
import gsap from 'gsap';
import './LoadingScreen.css';

const LoadingScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setIsVisible(false);
        onComplete && onComplete();
      }
    });

    // Initial setup
    gsap.set('.ai-brain', { scale: 0, opacity: 0 });
    gsap.set('.neural-network', { opacity: 0 });
    gsap.set('.data-streams', { opacity: 0 });
    gsap.set('.loading-text', { opacity: 0, y: 30 });
    gsap.set('.progress-bar', { width: '0%' });

    // Animation sequence
    tl.to('.ai-brain', {
      duration: 1,
      scale: 1,
      opacity: 1,
      ease: 'elastic.out(1, 0.5)'
    })
    .to('.neural-network', {
      duration: 0.8,
      opacity: 1,
      ease: 'power2.out'
    }, '-=0.5')
    .to('.data-streams', {
      duration: 0.6,
      opacity: 1,
      ease: 'power2.out'
    }, '-=0.3')
    .to('.loading-text', {
      duration: 0.8,
      opacity: 1,
      y: 0,
      ease: 'power2.out'
    }, '-=0.4')
    .to('.progress-bar', {
      duration: 2,
      width: '100%',
      ease: 'power2.inOut'
    }, '-=0.2')
    .to('.loading-container', {
      duration: 0.8,
      scale: 1.1,
      opacity: 0,
      ease: 'power2.in'
    }, '+=0.5');

  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="loading-container">
      <div className="ai-brain">
        <div className="brain-ring"></div>
        <div className="brain-core">
          <div className="brain-pulse"></div>
          <div className="brain-glow"></div>
        </div>
        <div className="neural-network">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="neuron"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.2}s`
              }}
            >
              <div className="neuron-pulse"></div>
            </div>
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={`connection-${i}`}
              className="connection"
              style={{
                animationDelay: `${i * 0.3}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="data-streams">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="data-stream"
            style={{
              left: `${10 + i * 20}%`,
              animationDelay: `${i * 0.2}s`
            }}
          >
            <div className="data-particle"></div>
            <div className="data-particle"></div>
            <div className="data-particle"></div>
          </div>
        ))}
      </div>

      <div className="loading-progress">
        <div className="progress-bar"></div>
      </div>

      <div className="loading-text">
        <h2>Prev-IX</h2>
        <p>Loading application components...</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
