import React from 'react';

// Main Export Component
export default function AITransformationAnimation() {
  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .ai-animation-container {
              justify-content: center !important;
              margin-left: 0 !important;
            }
          }
        `}
      </style>
      <div
        className="ai-animation-container"
        style={{
          width: '100%',
          height: '80vh',
          minHeight: '500px',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: '1rem',
          marginLeft: '-5%',
          backgroundColor: 'transparent'
        }}
      >
        <img
          src="/PREVIX_homePage-Photoroom.png"
          alt="AI Transformation"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
    </>
  );
}
