import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const BarbaProvider = ({ children }) => {
  const barbaInitialized = useRef(false);

  useEffect(() => {
    if (barbaInitialized.current) return;

    // Import Barba.js dynamically to avoid build issues
    import('@barba/core').then((barbaModule) => {
      const barbaInstance = barbaModule.default || barbaModule;

      // Initialize Barba.js only for initial load/reload
      barbaInstance.init({
        transitions: [
          {
            name: 'fade-slide',
            leave(data) {
              return gsap.to(data.current.container, {
                duration: 0.6,
                opacity: 0,
                x: -50,
                ease: 'power2.inOut'
              });
            },
            enter(data) {
              gsap.set(data.next.container, {
                opacity: 0,
                x: 50
              });

              return gsap.to(data.next.container, {
                duration: 0.6,
                opacity: 1,
                x: 0,
                ease: 'power2.inOut'
              });
            }
          },
          {
            name: 'glow-sweep',
            leave(data) {
              const tl = gsap.timeline();
              return tl
                .to(data.current.container, {
                  duration: 0.4,
                  opacity: 0.5,
                  ease: 'power2.in'
                })
                .to(data.current.container, {
                  duration: 0.4,
                  x: -100,
                  opacity: 0,
                  ease: 'power2.inOut'
                }, 0);
            },
            enter(data) {
              const tl = gsap.timeline();

              gsap.set(data.next.container, {
                opacity: 0,
                x: 100
              });

              // Glow sweep effect
              const glowElement = document.createElement('div');
              glowElement.style.cssText = `
                position: fixed;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(28, 145, 175, 0.3), transparent);
                z-index: 9999;
                pointer-events: none;
              `;
              document.body.appendChild(glowElement);

              return tl
                .to(data.next.container, {
                  duration: 0.6,
                  opacity: 1,
                  x: 0,
                  ease: 'power2.out'
                })
                .to(glowElement, {
                  duration: 0.8,
                  left: '100%',
                  ease: 'power2.inOut'
                }, 0)
                .call(() => {
                  if (glowElement.parentNode) {
                    glowElement.parentNode.removeChild(glowElement);
                  }
                });
            }
          }
        ],
        views: [
          {
            namespace: 'home',
            beforeEnter() {
              // Custom logic for home page
            }
          },
          {
            namespace: 'dashboard',
            beforeEnter() {
              // Custom logic for dashboard
            }
          }
        ]
      });

      barbaInitialized.current = true;

      // Cleanup on unmount
      return () => {
        if (barbaInitialized.current) {
          barbaInstance.destroy();
          barbaInitialized.current = false;
        }
      };
    });
  }, []);

  return (
    <div id="barba-wrapper" data-barba="wrapper">
      <div data-barba="container">
        {children}
      </div>
    </div>
  );
};

export default BarbaProvider;
