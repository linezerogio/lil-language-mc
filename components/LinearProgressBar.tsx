'use client';

import React, { useState, useEffect, useRef } from 'react';

const cleanPercentage = (progress: number) => {
    const isNegativeOrNaN = !Number.isFinite(+progress) || progress < 0; // we can set non-numbers to 0 here
    const isTooHigh = progress > 100;
    return isNegativeOrNaN ? 0 : isTooHigh ? 100 : +progress;
  };

export default function LinearProgressBar({ progress, height, strokeWidth, activeColor, inactiveColor } : { progress: number, height: number, strokeWidth: number, activeColor: string, inactiveColor: string }) {
    const radius = height / 2;
    const percentage = cleanPercentage(progress);
    const svgRef = useRef<SVGSVGElement>(null);
    const [svgWidth, setSvgWidth] = useState<number>(0);

    useEffect(() => {
        if (svgRef.current) {
            setSvgWidth(svgRef.current.clientWidth);
        }
    }, [svgRef.current]);
 
    useEffect(() => {
        const handleResize = () => {
            svgRef.current && setSvgWidth(svgRef.current.clientWidth);
        };
 
        window.addEventListener('resize', handleResize);
 
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
    const activeWidth = (svgWidth - height) * (percentage / 100);
  
    return (
      <svg ref={svgRef} width="100%" height={height} viewBox="0 0 ${svgWidth} ${height}">
      <path
        d={`M ${radius} ${radius} h ${svgWidth - height}`}
        fill="none"
        stroke={inactiveColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d={`M ${radius} ${radius} h ${activeWidth}`}
        fill="none"
        stroke={activeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      </svg>
    );
  };