'use client';

import React, { useState, useEffect, useRef } from 'react';

const cleanPercentage = (progress: number) => {
    const isNegativeOrNaN = !Number.isFinite(+progress) || progress < 0; // we can set non-numbers to 0 here
    const isTooHigh = progress > 100;
    return isNegativeOrNaN ? 0 : isTooHigh ? 100 : +progress;
  };

interface LinearProgressBarProps {
  progress: number;
  height: number;
  strokeWidth: number;
  activeColor: string;
  inactiveColor: string;
}

const LinearProgressBar: React.FC<LinearProgressBarProps> = ({ 
  progress, 
  height, 
  strokeWidth, 
  activeColor, 
  inactiveColor 
}) => {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <div 
      className="w-full rounded-full overflow-hidden" 
      style={{ height: `${height}px`, backgroundColor: inactiveColor }}
    >
      <div 
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ 
          width: `${clampedProgress}%`, 
          backgroundColor: activeColor 
        }}
      />
    </div>
  );
};

export default LinearProgressBar;