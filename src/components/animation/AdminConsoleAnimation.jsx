import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './AdminConsoleAnimation.css';

const AdminConsoleAnimation = ({ isLoading, onComplete }) => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isLoading || !containerRef.current) return;

    const container = containerRef.current;

    // Create console-style typing effect
    const consoleLines = [
      '> Initializing admin console...',
      '> Loading user permissions...',
      '> Establishing secure connection...',
      '> System check complete.',
      '> Access granted.'
    ];

    let currentLine = 0;
    const typeWriter = () => {
      if (currentLine < consoleLines.length) {
        const lineElement = document.createElement('div');
        lineElement.className = 'console-line';
        lineElement.textContent = consoleLines[currentLine];
        document.querySelector('.console-output').appendChild(lineElement);

        gsap.fromTo(lineElement,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }
        );

        currentLine++;
        setTimeout(typeWriter, 600);
      }
    };

    // Main admin loading animation
    animationRef.current = gsap.timeline({
      onComplete: () => {
        onComplete && onComplete();
      }
    });

    // Console elements
    gsap.set('.admin-console-core', { scale: 0, opacity: 0 });
    gsap.set('.console-screen', { opacity: 0, scale: 0.8 });
    gsap.set('.console-cursor', { opacity: 0 });
    gsap.set('.admin-loader-text', { opacity: 0, y: 30 });

    animationRef.current
      .to('.admin-console-core', {
        duration: 0.8,
        scale: 1,
        opacity: 1,
        ease: 'back.out(1.7)'
      })
      .to('.console-screen', {
        duration: 0.6,
        opacity: 1,
        scale: 1,
        ease: 'power2.out'
      }, '-=0.4')
      .to('.console-cursor', {
        duration: 0.3,
        opacity: 1,
        ease: 'power2.in'
      }, '-=0.2')
      .call(() => {
        typeWriter();
      })
      .to('.admin-loader-text', {
        duration: 0.6,
        opacity: 1,
        y: 0,
        ease: 'power2.out'
      }, '-=1')
      // Final console flash
      .to('.console-screen', {
        duration: 0.2,
        backgroundColor: 'rgba(28, 145, 175, 0.3)',
        ease: 'power2.in'
      })
      .to('.console-screen', {
        duration: 0.2,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        ease: 'power2.out'
      })
      // Final fade out
      .to('.admin-loading-container', {
        duration: 0.8,
        opacity: 0,
        scale: 1.02,
        ease: 'power2.in'
      });

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [isLoading, onComplete]);

  if (!isLoading) return null;

  return (
    <div ref={containerRef} className="admin-loading-container">
      <div className="admin-console-core">
        <div className="console-screen">
          <div className="console-header">
            <div className="console-title">ADMIN CONSOLE v2.1</div>
            <div className="console-status">
              <span className="status-dot"></span>
              SECURE CONNECTION
            </div>
          </div>
          <div className="console-output">
            <span className="console-cursor">█</span>
          </div>
        </div>
        <div className="console-glow"></div>
      </div>
      <div className="admin-loader-text">
        <h3>Accessing Admin Panel</h3>
        <p>Initializing administrative controls...</p>
      </div>
    </div>
  );
};

export default AdminConsoleAnimation;
