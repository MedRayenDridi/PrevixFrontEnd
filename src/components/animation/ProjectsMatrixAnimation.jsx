import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './ProjectsMatrixAnimation.css';

const ProjectsMatrixAnimation = ({ isLoading, onComplete }) => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isLoading || !containerRef.current) return;

    const container = containerRef.current;

    // Create matrix-style falling characters
    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const columns = Math.floor(window.innerWidth / 20);
    const drops = [];

    for (let i = 0; i < columns; i++) {
      const drop = document.createElement('div');
      drop.className = 'matrix-drop';
      drop.style.left = i * 20 + 'px';
      drop.style.animationDelay = Math.random() * 2 + 's';
      drop.textContent = characters[Math.floor(Math.random() * characters.length)];
      container.appendChild(drop);
      drops.push(drop);
    }

    // Main projects loading animation
    animationRef.current = gsap.timeline({
      onComplete: () => {
        // Clean up drops
        drops.forEach(drop => {
          if (drop.parentNode) {
            drop.parentNode.removeChild(drop);
          }
        });
        onComplete && onComplete();
      }
    });

    // Central project loader
    gsap.set('.projects-loader-core', { scale: 0, opacity: 0 });
    gsap.set('.projects-loader-cubes', { scale: 0, opacity: 0, rotation: 0 });
    gsap.set('.projects-loader-text', { opacity: 0, y: 30 });

    animationRef.current
      .to('.projects-loader-core', {
        duration: 0.8,
        scale: 1,
        opacity: 1,
        ease: 'back.out(1.7)'
      })
      .to('.projects-loader-cubes', {
        duration: 1.2,
        scale: 1,
        opacity: 1,
        rotation: 360,
        ease: 'power2.out'
      }, '-=0.4')
      .to('.projects-loader-text', {
        duration: 0.6,
        opacity: 1,
        y: 0,
        ease: 'power2.out'
      }, '-=0.8')
      // Cube rotation animation
      .to('.projects-loader-cubes .cube', {
        duration: 1,
        rotationY: 360,
        stagger: 0.1,
        ease: 'power2.inOut',
        repeat: 2
      }, '-=0.5')
      // Matrix effect
      .to('.matrix-drop', {
        duration: 2,
        opacity: 0,
        ease: 'power2.in'
      }, 0)
      // Final fade out
      .to('.projects-loading-container', {
        duration: 0.8,
        opacity: 0,
        scale: 1.05,
        ease: 'power2.in'
      });

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
      // Clean up drops
      drops.forEach(drop => {
        if (drop.parentNode) {
          drop.parentNode.removeChild(drop);
        }
      });
    };
  }, [isLoading, onComplete]);

  if (!isLoading) return null;

  return (
    <div ref={containerRef} className="projects-loading-container">
      <div className="projects-loader-core">
        <div className="projects-loader-cubes">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="cube"
              style={{
                '--delay': `${i * 0.1}s`,
                transform: `rotateY(${i * 45}deg) translateZ(30px)`
              }}
            ></div>
          ))}
        </div>
        <div className="projects-loader-center">
          <div className="projects-loader-pulse"></div>
        </div>
      </div>
      <div className="projects-loader-text">
        <h3>Loading Projects</h3>
        <p>Initializing project matrix...</p>
      </div>
    </div>
  );
};

export default ProjectsMatrixAnimation;
