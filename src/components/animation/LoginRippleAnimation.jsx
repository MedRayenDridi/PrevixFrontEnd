import React, { useState } from 'react';
import { gsap } from 'gsap';
import './LoginRippleAnimation.css';

const LoginRippleAnimation = ({ children, onClick }) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size
    };

    setRipples(prev => [...prev, newRipple]);

    // Animate ripple
    gsap.fromTo(`.ripple-${newRipple.id}`,
      {
        scale: 0,
        opacity: 1
      },
      {
        scale: 4,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }
      }
    );

    // Button glow effect
    gsap.to(button, {
      boxShadow: '0 0 30px rgba(18, 58, 99, 0.5)',
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });

    // Call original onClick
    if (onClick) {
      setTimeout(() => onClick(e), 200);
    }
  };

  return (
    <div className="login-ripple-container" onClick={handleClick}>
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className={`ripple ripple-${ripple.id}`}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size
          }}
        />
      ))}
    </div>
  );
};

export default LoginRippleAnimation;
