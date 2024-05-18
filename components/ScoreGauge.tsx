import React from "react";

const ScoreGauge = ({
  score,
  max,
  word,
}: {
  score: number;
  max: number;
  word: string;
}) => {
  const percentage = (score / max) * 100;
  const angle = (percentage / 100) * 270;

  const width = 432;
  const height = 432;
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

  const arrowSize = 15;
  const arrowX = centerX - (160 + arrowSize) * Math.cos(((endAngle2 - 2) * Math.PI) / 180);
  const arrowY = centerY + (160 + arrowSize) * Math.sin(((endAngle2 - 2) * Math.PI) / 180);

  const arrowAngle = angle + 137;

  const inactiveTrackWidth = endAngle - startAngle;
  const gradientWidth = (inactiveTrackWidth * percentage) / 100;

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
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path
          d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX2} ${endY2}`}
          fill="none"
          stroke="url(#activeTrackGradient)"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path
          d={`M ${arrowX} ${arrowY - arrowSize}
             L ${arrowX + arrowSize} ${arrowY}
             L ${arrowX} ${arrowY + arrowSize}
             Z`}
          fill="#F5F5F5"
          transform={`rotate(${arrowAngle} ${arrowX + (arrowSize / 2)} ${arrowY + (arrowSize / 2)})`}
        />
      </svg>
      <div className="w-[320px] h-[320px] bg-[#1B1C1D] rounded-full flex justify-center items-center absolute top-14 left-14">
        <div className="w-[285px] h-[285px] border-2 border-solid border-[#343737] rounded-full flex flex-col justify-center items-center">
          <h1 className="text-[40px] md:text-[65px] leading-none font-bold tracking-[0.06em] py-[15px] font-[termina]">
            {score}
          </h1>
          <p className="text-[18px] tracking-[0.90px] leading-[normal] text-[#565757]">
            4-Bar Mode | Easy
          </p>
          <p className="text-[18px] tracking-[0.90px] leading-[normal] text-[#565757]">
            &quot;{word.charAt(0).toUpperCase() + word.substring(1)}&quot;
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;
