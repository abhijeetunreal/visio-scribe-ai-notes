
import React from 'react';

const AnimatedLogo = () => {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center mb-8">
      {/* Dashed ring, suggesting pathways */}
      <div className="absolute w-1/2 h-1/2 border border-dashed border-primary/20 animate-[spin_10s_linear_infinite] animate-morph"></div>
    </div>
  );
};

export default AnimatedLogo;
