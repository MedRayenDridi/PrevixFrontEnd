import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './LoginLoadingAnimation.css';

const LoginLoadingAnimation = ({ isLoading, onComplete }) => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isLoading || !containerRef.current) return;

    const container = containerRef.current;

    // Resolve targets from container only so GSAP never runs on missing elements (avoids "target not found" warning)
    const logo = container.querySelector('.login-anim-logo');
    const loaderCore = container.querySelector('.login-loader-core');
    const lockIcon = container.querySelector('.login-lock-icon');
    const loaderText = container.querySelector('.login-loader-text');
    const progressRing = container.querySelector('.login-progress-ring');
    if (!logo || !loaderCore || !lockIcon || !loaderText) return;

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
        lockIcons.forEach(icon => {
          if (icon.parentNode) icon.parentNode.removeChild(icon);
        });
        if (onComplete) onComplete();
      }
    });

    gsap.set(logo, { scale: 0, opacity: 0 });
    gsap.set(loaderCore, { scale: 0, opacity: 0 });
    gsap.set(lockIcon, { scale: 0, opacity: 0, rotation: -45 });
    gsap.set(loaderText, { opacity: 0, y: 30 });
    if (progressRing) gsap.set(progressRing, { strokeDashoffset: 283 });

    const tl = animationRef.current;
    tl.to(logo, { duration: 0.8, scale: 1, opacity: 1, ease: 'back.out(1.7)' })
      .to(loaderCore, { duration: 0.8, scale: 1, opacity: 1, ease: 'back.out(1.7)' }, '-=0.4')
      .to(lockIcon, { duration: 1, scale: 1, opacity: 1, rotation: 0, ease: 'elastic.out(1, 0.5)' }, '-=0.4')
      .to(loaderText, { duration: 0.6, opacity: 1, y: 0, ease: 'power2.out' }, '-=0.6');
    if (progressRing) {
      tl.to(progressRing, { duration: 1.5, strokeDashoffset: 0, ease: 'power2.inOut' }, '-=0.5');
    }
    tl.to(lockIcon, { duration: 0.4, y: -5, ease: 'power2.inOut', yoyo: true, repeat: 1 }, '-=0.8')
      .to(lockIcons, { duration: 2, y: 'random(-50, 50)', x: 'random(-50, 50)', opacity: 0, ease: 'power2.inOut', stagger: 0.1 }, 0)
      .to(container, { duration: 0.8, opacity: 0, scale: 1.05, ease: 'power2.in' });

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
          <circle
            className="login-progress-bg"
            cx="50"
            cy="50"
            r="45"
          />
          <circle
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
