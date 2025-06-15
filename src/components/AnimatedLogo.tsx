
import React from 'react';

const AnimatedLogo = () => {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center mb-8">
      {/* Concentric, morphing shapes */}
      <div className="absolute w-1/4 h-1/4 border border-dashed border-primary/10 animate-[spin_8s_linear_infinite_reverse] animate-morph"></div>
      <div className="absolute w-1/2 h-1/2 border border-dashed border-primary/20 animate-[spin_10s_linear_infinite] animate-morph"></div>
      <div className="absolute w-3/4 h-3/4 border border-dashed border-primary/30 animate-[spin_12s_linear_infinite_reverse] animate-morph"></div>
      <div className="absolute w-full h-full border border-dashed border-primary/40 animate-[spin_14s_linear_infinite] animate-morph"></div>
    </div>
  );
};

export default AnimatedLogo;
