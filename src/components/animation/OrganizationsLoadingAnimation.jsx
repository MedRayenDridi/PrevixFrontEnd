import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './OrganizationsLoadingAnimation.css';

const OrganizationsLoadingAnimation = ({ isLoading, onComplete }) => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isLoading || !containerRef.current) return;

    const container = containerRef.current;

    // Create floating organization icons
    const icons = [];
    for (let i = 0; i < 15; i++) {
      const icon = document.createElement('div');
      icon.className = 'org-icon-float';
      icon.style.left = Math.random() * 100 + '%';
      icon.style.top = Math.random() * 100 + '%';
      icon.style.animationDelay = Math.random() * 3 + 's';
      icon.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
      </svg>`;
      container.appendChild(icon);
      icons.push(icon);
    }

    // Main organization loading animation
    animationRef.current = gsap.timeline({
      onComplete: () => {
        // Clean up icons
        icons.forEach(icon => {
          if (icon.parentNode) {
            icon.parentNode.removeChild(icon);
          }
        });
        if (onComplete) onComplete();
      }
    });

    // Logo and loader elements
    gsap.set('.org-logo', { scale: 0, opacity: 0 });
    gsap.set('.org-loader-core', { scale: 0, opacity: 0 });
    gsap.set('.org-loader-buildings', { scale: 0, opacity: 0 });
    gsap.set('.org-loader-text', { opacity: 0, y: 30 });

    animationRef.current
      .to('.org-logo', {
        duration: 0.8,
        scale: 1,
        opacity: 1,
        ease: 'back.out(1.7)'
      })
      .to('.org-loader-core', {
        duration: 0.8,
        scale: 1,
        opacity: 1,
        ease: 'back.out(1.7)'
      }, '-=0.4')
      .to('.org-loader-buildings', {
        duration: 1,
        scale: 1,
        opacity: 1,
        ease: 'power2.out'
      }, '-=0.4')
      .to('.org-loader-text', {
        duration: 0.6,
        opacity: 1,
        y: 0,
        ease: 'power2.out'
      }, '-=0.6')
      // Building animation
      .to('.building-bar', {
        duration: 0.8,
        scaleY: 1,
        stagger: 0.1,
        ease: 'power2.out'
      }, '-=0.4')
      // Float animation
      .to('.org-icon-float', {
        duration: 2,
        y: 'random(-50, 50)',
        x: 'random(-50, 50)',
        opacity: 0,
        ease: 'power2.inOut',
        stagger: 0.1
      }, 0)
      // Final fade out
      .to('.org-loading-container', {
        duration: 0.8,
        opacity: 0,
        scale: 1.05,
        ease: 'power2.in'
      });

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
      // Clean up icons
      icons.forEach(icon => {
        if (icon.parentNode) {
          icon.parentNode.removeChild(icon);
        }
      });
    };
  }, [isLoading, onComplete]);

  if (!isLoading) return null;

  return (
    <div ref={containerRef} className="org-loading-container">
      <img src="/Logo-Prevex-Africa.png" alt="Prevex Africa Logo" className="org-logo" />
      <div className="org-loader-core">
        <div className="org-loader-buildings">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="building-bar"
              style={{
                height: `${30 + i * 8}px`,
                animationDelay: `${i * 0.1}s`
              }}
            ></div>
          ))}
        </div>
        <div className="org-loader-pulse"></div>
      </div>
      <div className="org-loader-text">
        <h3>Chargement des Organisations</h3>
        <p>Récupération des données...</p>
      </div>
    </div>
  );
};

export default OrganizationsLoadingAnimation;
