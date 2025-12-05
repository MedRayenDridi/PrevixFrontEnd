import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './DashboardLoadingAnimation.css';

const DashboardLoadingAnimation = ({ isLoading, onComplete }) => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isLoading || !containerRef.current) return;

    const container = containerRef.current;

    // Create floating data particles (in navy blue for light theme)
    const particles = [];
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'data-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 2 + 's';
      container.appendChild(particle);
      particles.push(particle);
    }

    // Main dashboard loading animation
    animationRef.current = gsap.timeline({
      onComplete: () => {
        // Clean up particles
        particles.forEach(particle => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        });
        onComplete && onComplete();
      }
    });

    // Logo and central loading indicator
    gsap.set('.dashboard-logo', { opacity: 0, scale: 0.8 });
    gsap.set('.dashboard-loader-core', { scale: 0, opacity: 0 });
    gsap.set('.dashboard-loader-rings', { scale: 0, opacity: 0 });
    gsap.set('.dashboard-loader-text', { opacity: 0, y: 20 });

    animationRef.current
      .to('.dashboard-logo', {
        duration: 1.2,
        opacity: 1,
        scale: 1,
        ease: 'power2.out'
      })
      .to('.dashboard-loader-core', {
        duration: 0.8,
        scale: 1,
        opacity: 1,
        ease: 'back.out(1.7)'
      }, '-=0.5')
      .to('.dashboard-loader-rings', {
        duration: 1,
        scale: 1,
        opacity: 1,
        ease: 'power2.out'
      }, '-=0.3')
      .to('.dashboard-loader-text', {
        duration: 0.5,
        opacity: 1,
        y: 0,
        ease: 'power2.out'
      }, '-=0.5')
      // Pulse animation
      .to('.dashboard-loader-core', {
        duration: 0.6,
        scale: 1.2,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 2
      })
      // Data flow animation
      .to('.data-particle', {
        duration: 2,
        x: 'random(-100, 100)',
        y: 'random(-100, 100)',
        opacity: 0,
        ease: 'power2.inOut',
        stagger: 0.1
      }, 0)
      // Final fade out
      .to('.dashboard-loading-container', {
        duration: 0.8,
        opacity: 0,
        scale: 1.1,
        ease: 'power2.in'
      });

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
      // Clean up particles
      particles.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
    };
  }, [isLoading, onComplete]);

  if (!isLoading) return null;

  return (
    <div ref={containerRef} className="dashboard-loading-container">
      <img src="/Logo-Prevex-Africa.png" alt="Prevex Africa Logo" className="dashboard-logo" />
      <div className="dashboard-loader-core">
        <div className="dashboard-loader-sphere"></div>
        <div className="dashboard-loader-rings">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="dashboard-loader-ring"
              style={{
                animationDelay: `${i * 0.3}s`,
                width: `${50 + i * 15}px`,
                height: `${50 + i * 15}px`
              }}
            ></div>
          ))}
        </div>
      </div>
      <div className="dashboard-loader-text">
        <h3>Chargement du Tableau de Bord</h3>
        <p>Analyse de vos données...</p>
      </div>
    </div>
  );
};

export default DashboardLoadingAnimation;
