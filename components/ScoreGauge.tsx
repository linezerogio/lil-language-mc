import React, { useEffect, useState } from "react";
import ScoreBreakdown from "@/types/breakdown";

interface ScoreGaugeProps {
  score: number;
  max: number;
  word: string;
  scoreBreakdown: ScoreBreakdown;
  difficulty: string;
  lines: string[];
  onScoreBreakdownClick: () => void;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  max,
  word,
  scoreBreakdown,
  difficulty,
  lines,
  onScoreBreakdownClick
}) => {
  const [darkMode, setDarkMode] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Gauge geometry state
  const [height, setHeight] = useState(432);
  const [width, setWidth] = useState(432);
  const [strokeWidth, setStrokeWidth] = useState(22);

  // Derived geometry
  const radius = width / 2 - 11;
  const centerX = width / 2;
  const centerY = width / 2;
  const startAngle = 45;
  const endAngle = 135;
  const percentage = (score / max) * 100;
  const angle = (percentage / 100) * 270;
  const endAngle2 = 45 - angle;

  // Arc endpoints
  const startX = centerX - radius * Math.cos((startAngle * Math.PI) / 180);
  const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
  const endX = centerX - radius * Math.cos((endAngle * Math.PI) / 180);
  const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
  const endX2 = centerX - radius * Math.cos((endAngle2 * Math.PI) / 180);
  const endY2 = centerY + radius * Math.sin((endAngle2 * Math.PI) / 180);
  const largeArcFlag = endAngle2 >= -135 ? 0 : 1;

  useEffect(() => {
    const updateDimensions = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    setWidth(isDesktop ? 432 : 292);
    setHeight(isDesktop ? 432 : 292);
    setStrokeWidth(isDesktop ? 22 : 14);
  }, [isDesktop]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const inactiveTrackWidth = endAngle - startAngle;
  const gradientWidth = (inactiveTrackWidth * percentage) / 100;

  // Arrow position calculation - position at the outside edge of the inner circle
  const innerCircleRadius = width > 320 ? 160 : 112; // Desktop: 320px/2, Mobile: 224px/2
  const arrowRadius = innerCircleRadius; // Position arrow slightly outside the inner circle
  const arrowAngle = endAngle2; // Use the same angle as the end of the active track
  const arrowX = centerX - arrowRadius * Math.cos((arrowAngle * Math.PI) / 180);
  const arrowY = centerY + arrowRadius * Math.sin((arrowAngle * Math.PI) / 180);
  
  // Arrow rotation to point toward the center
  const arrowRotation = 220 - arrowAngle; // Adjust rotation so arrow points inward

  return (
    <div className="relative" onClick={!isDesktop ? onScoreBreakdownClick : undefined}>
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
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX2} ${endY2}`}
          fill="none"
          stroke="url(#activeTrackGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="-z-10"
        />
        {/* Arrow pointing to the end of active track */}
        <g transform={`translate(${arrowX}, ${arrowY}) rotate(${arrowRotation})`}>
          <image
            href="/icons/gauge_arrow.svg"
            width="15"
            height="16"
            x="-8"
            y="-8"
            z={100}
            style={{
              filter: darkMode ? 'none' : 'brightness(0) saturate(100%) invert(8%) sepia(6%) saturate(468%) hue-rotate(169deg) brightness(96%) contrast(92%)'
            }}
          />
        </g>
      </svg>
      <div className="w-[224px] md:w-[320px] h-[224px] md:h-[320px] bg-white dark:bg-[#1B1C1D] rounded-full flex justify-center items-center absolute top-9 md:top-14 left-9 md:left-14">
        <div className="w-[200px] md:w-[285px] h-[200px] md:h-[285px] border-2 border-solid border-[#f5f5f5] dark:border-[#343737] rounded-full flex flex-col justify-center items-center">
          <h1 className="text-[56px] md:text-[65px] leading-none font-bold tracking-[0.06em] py-[15px] font-[termina]">
            {score}
          </h1>
          <p className="md:hidden text-[12px] tracking-[0.6px] leading-[normal] text-[#565757]">
            Click for score details
          </p>
          <p className="text-[18px] tracking-[0.90px] leading-[normal] text-[#565757] hidden md:block">
            4-Bar Mode | {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </p>
          <p className="text-[18px] tracking-[0.90px] leading-[normal] text-[#565757] hidden md:block">
            &quot;{word.charAt(0).toUpperCase() + word.substring(1)}&quot;
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;
