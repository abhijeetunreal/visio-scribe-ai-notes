
import React from 'react';

const Node = ({ rotation, delay }: { rotation: string; delay: string }) => (
  <div className="absolute w-full h-full" style={{ transform: `rotate(${rotation})` }}>
    <div 
      className="absolute top-0 left-1/2 -ml-1 w-2 h-2 rounded-full animate-node-fire" 
      style={{ animationDelay: delay }}
    ></div>
  </div>
);

const AnimatedLogo = () => {
  const nodeCount = 8;

  return (
    <div className="relative w-32 h-32 flex items-center justify-center mb-8">
      {/* Outer ring with firing nodes */}
      <div className="absolute w-full h-full rounded-full">
        {Array.from({ length: nodeCount }).map((_, i) => (
          <Node
            key={i}
            rotation={`${(360 / nodeCount) * i}deg`}
            delay={`${(2 / nodeCount) * i}s`}
          />
        ))}
      </div>
      
      {/* Inner rotating ring */}
      <div className="absolute w-3/4 h-3/4 border-t-2 border-b-2 border-primary/30 animate-[spin_8s_linear_infinite_reverse] animate-morph"></div>
      
      {/* Dashed ring, suggesting pathways */}
      <div className="absolute w-1/2 h-1/2 border border-dashed border-primary/20 animate-[spin_10s_linear_infinite] animate-morph"></div>

      {/* Central Core */}
      <div className="w-1/4 h-1/4 bg-primary/80 shadow-[0_0_20px_theme(colors.primary)] animate-pulse animate-morph"></div>
    </div>
  );
};

export default AnimatedLogo;
