import React, { useEffect, useState } from "react";
import { ScoreBreakdownSheet } from "./ScoreBreakdownSheet";
import ScoreBreakdown from "@/types/breakdown";

interface ScoreGaugeProps {
  score: number;
  max: number;
  word: string;
  scoreBreakdown: ScoreBreakdown;
  difficulty: string;
  lines: string[];
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  max,
  word,
  scoreBreakdown,
  difficulty,
  lines
}) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);
  
  const percentage = (score / max) * 100;
  const angle = (percentage / 100) * 270;

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const width = isMobile ? 280 : 432;
  const height = isMobile ? 280 : 432;
  const radius = Math.min(width, height) / 2 - 11;
  const centerX = width / 2;
  const centerY = height / 2;

  const startAngle = 45;
  const endAngle = 135;
  const endAngle2 = 45 - angle;

  const startX = centerX - radius * Math.cos((startAngle * Math.PI) / 180);
  const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
  const endX = centerX - radius * Math.cos((endAngle * Math.PI) / 180);
  const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
  const endX2 = centerX - radius * Math.cos((endAngle2 * Math.PI) / 180);
  const endY2 = centerY + radius * Math.sin((endAngle2 * Math.PI) / 180);

  const largeArcFlag = endAngle2 >= -135 ? 0 : 1;

  const arrowSize = isMobile ? 10 : 15;
  const arrowWidthBasedOnRotation = Math.abs(arrowSize * Math.sin((angle * Math.PI) / 180));
  const arrowHeightBasedOnRotation = Math.abs(arrowSize * Math.cos((angle * Math.PI) / 180));
  const arrowX = centerX - ((isMobile ? 102 : 160) + (arrowWidthBasedOnRotation)) * Math.cos(((endAngle2 - 2) * Math.PI) / 180);
  const arrowY = centerY + ((isMobile ? 102 : 160) + (arrowHeightBasedOnRotation)) * Math.sin(((endAngle2 - 2) * Math.PI) / 180);

  const arrowAngle = angle + 137;

  const inactiveTrackWidth = endAngle - startAngle;
  const gradientWidth = (inactiveTrackWidth * percentage) / 100;

  // Mobile score gauge content (clickable for bottom sheet)
  const MobileGaugeContent = (
    <div className="w-[204px] h-[204px] bg-white dark:bg-[#1B1C1D] rounded-full flex justify-center items-center absolute top-[40px] left-[40px]">
      <div className="w-[170px] h-[170px] border-2 border-solid border-[#f5f5f5] dark:border-[#343737] rounded-full flex flex-col justify-center items-center">
        <h1 className="text-[40px] leading-none font-bold tracking-[0.06em] pb-[12px] font-[termina]">
          {score}
        </h1>
        <p className="text-[11px] tracking-[0.55px] leading-[normal] text-[#565757]">
          Click for score details
        </p>
      </div>
    </div>
  );

  // Desktop score gauge content
  const DesktopGaugeContent = (
    <div className="w-[320px] h-[320px] bg-white dark:bg-[#1B1C1D] rounded-full flex justify-center items-center absolute top-14 left-14">
      <div className="w-[285px] h-[285px] border-2 border-solid border-[#f5f5f5] dark:border-[#343737] rounded-full flex flex-col justify-center items-center">
        <h1 className="text-[65px] leading-none font-bold tracking-[0.06em] py-[15px] font-[termina]">
          {score}
        </h1>
        <p className="text-[18px] tracking-[0.90px] leading-[normal] text-[#565757]">
          4-Bar Mode | {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </p>
        <p className="text-[18px] tracking-[0.90px] leading-[normal] text-[#565757]">
          &quot;{word.charAt(0).toUpperCase() + word.substring(1)}&quot;
        </p>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="inactiveTrackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B8F73A" />
            <stop offset="100%" stopColor="#5CE2C7" />
          </linearGradient>
          <linearGradient id="activeTrackGradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B8F73A" />
            <stop offset={`${(gradientWidth / inactiveTrackWidth) * 100}%`} stopColor={percentage < 35 ? "#B8F73A" : "#5CE2C7"} />
          </linearGradient>
        </defs>
        <path
          d={`M ${startX} ${startY} A ${radius} ${radius} 0 1 1 ${endX} ${endY}`}
          fill="none"
          stroke="url(#inactiveTrackGradient)"
          strokeOpacity={0.2}
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX2} ${endY2}`}
          fill="none"
          stroke="url(#activeTrackGradient)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d={`M ${arrowX} ${arrowY - arrowSize}
             L ${arrowX + arrowSize} ${arrowY}
             L ${arrowX} ${arrowY + arrowSize}
             Z`}
          fill={darkMode ? "#F5F5F5" : "#000000"}
          transform={`rotate(${arrowAngle} ${arrowX + (arrowSize / 2)} ${arrowY + (arrowSize / 2)})`}
        />
      </svg>
      
      {/* Responsive display - Mobile vs Desktop */}
      <div className="hidden md:block">
        {DesktopGaugeContent}
      </div>
      
      <div className="md:hidden">
        <ScoreBreakdownSheet 
          scoreBreakdown={scoreBreakdown} 
          trigger={MobileGaugeContent}
          word={word}
          difficulty={difficulty}
          lines={lines}
        />
      </div>
    </div>
  );
};

export default ScoreGauge;
