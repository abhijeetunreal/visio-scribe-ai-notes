
import React from 'react';

const AnimatedLogo = () => {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center mb-8">
      {/* Central element */}
      <div className="w-12 h-12 bg-primary/90 rounded-2xl shadow-lg"></div>

      {/* Pulsing ripple rings */}
      <div
        className="absolute w-full h-full rounded-full border-2 border-primary/20 animate-ripple"
        style={{ animationDelay: '0s' }}
      ></div>
      <div
        className="absolute w-full h-full rounded-full border-2 border-primary/20 animate-ripple"
        style={{ animationDelay: '1s' }}
      ></div>
    </div>
  );
};

export default AnimatedLogo;
