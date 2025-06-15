
import React from 'react';

const AnimatedLogo = () => {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center mb-8">
      {/* Outer pulsing ring */}
      <div className="absolute w-full h-full rounded-full bg-primary/10 animate-pulse"></div>

      {/* Middle static ring */}
      <div className="absolute w-3/4 h-3/4 rounded-full border-2 border-primary/30"></div>
      
      {/* Inner rotating ring */}
      <div className="absolute w-1/2 h-1/2 rounded-full border-t-2 border-primary animate-[spin_3s_linear_infinite]"></div>

      {/* Central core */}
      <div className="w-1/4 h-1/4 bg-primary/80 rounded-full shadow-[0_0_20px_theme(colors.primary)]"></div>
    </div>
  );
};

export default AnimatedLogo;
