import React from 'react';

const GradientBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-10">
      <div
        className="absolute inset-0 bg-gradient-to-r from-indigo-700/5 via-blue-600/20 to-indigo-700/5  shadow-xl"
        style={{ pointerEvents: 'none' }}
      ></div>
    </div>
  );
};

export default GradientBackground;
