import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './LoginLoadingAnimation.css';

const LoginLoadingAnimation = ({ isLoading, onComplete }) => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isLoading || !containerRef.current) return;

    const container = containerRef.current;

    // Create floating lock icons
    const lockIcons = [];
    for (let i = 0; i < 12; i++) {
      const icon = document.createElement('div');
      icon.className = 'login-icon-float';
      icon.style.left = Math.random() * 100 + '%';
      icon.style.top = Math.random() * 100 + '%';
      icon.style.animationDelay = Math.random() * 3 + 's';
      icon.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
      </svg>`;
      container.appendChild(icon);
      lockIcons.push(icon);
    }

    // Main login loading animation
    animationRef.current = gsap.timeline({
      onComplete: () => {
        // Clean up icons
        lockIcons.forEach(icon => {
          if (icon.parentNode) {
            icon.parentNode.removeChild(icon);
          }
        });
        if (onComplete) onComplete();
      }
    });

    // Logo and loader elements
    gsap.set('.login-anim-logo', { scale: 0, opacity: 0 });
    gsap.set('.login-loader-core', { scale: 0, opacity: 0 });
    gsap.set('.login-lock-icon', { scale: 0, opacity: 0, rotation: -45 });
    gsap.set('.login-loader-text', { opacity: 0, y: 30 });
    gsap.set('.login-progress-ring', { strokeDashoffset: 283 });

    animationRef.current
      .to('.login-anim-logo', {
        duration: 0.8,
        scale: 1,
        opacity: 1,
        ease: 'back.out(1.7)'
      })
      .to('.login-loader-core', {
        duration: 0.8,
        scale: 1,
        opacity: 1,
        ease: 'back.out(1.7)'
      }, '-=0.4')
      .to('.login-lock-icon', {
        duration: 1,
        scale: 1,
        opacity: 1,
        rotation: 0,
        ease: 'elastic.out(1, 0.5)'
      }, '-=0.4')
      .to('.login-loader-text', {
        duration: 0.6,
        opacity: 1,
        y: 0,
        ease: 'power2.out'
      }, '-=0.6')
      // Progress ring animation
      .to('.login-progress-ring', {
        duration: 1.5,
        strokeDashoffset: 0,
        ease: 'power2.inOut'
      }, '-=0.5')
      // Lock unlock animation
      .to('.login-lock-icon', {
        duration: 0.4,
        y: -5,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 1
      }, '-=0.8')
      // Float animation
      .to('.login-icon-float', {
        duration: 2,
        y: 'random(-50, 50)',
        x: 'random(-50, 50)',
        opacity: 0,
        ease: 'power2.inOut',
        stagger: 0.1
      }, 0)
      // Final fade out
      .to('.login-loading-animation-container', {
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
      lockIcons.forEach(icon => {
        if (icon.parentNode) {
          icon.parentNode.removeChild(icon);
        }
      });
    };
  }, [isLoading, onComplete]);

  if (!isLoading) return null;

  return (
    <div ref={containerRef} className="login-loading-animation-container">
      <img src="/Logo-Prevex-Africa.png" alt="Prevex Africa Logo" className="login-anim-logo" />
      <div className="login-loader-core">
        <svg className="login-progress-circle" viewBox="0 0 100 100">
          ircle
            className="login-progress-bg"
            cx="50"
            cy="50"
            r="45"
          />
          ircle
            className="login-progress-ring"
            cx="50"
            cy="50"
            r="45"
          />
        </svg>
        <div className="login-lock-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
        </div>
      </div>
      <div className="login-loader-text">
        <h3>Connexion en cours</h3>
        <p>Authentification sécurisée...</p>
      </div>
    </div>
  );
};

export default LoginLoadingAnimation;
