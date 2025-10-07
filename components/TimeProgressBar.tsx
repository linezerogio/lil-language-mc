'use client'

import React from 'react';

const calculateColor = (percentage: number) => {
    return (percentage > 75 ? 'bg-[#5DE3C8]' : (percentage > 50 ? 'bg-[#5DE36A]' : (percentage > 25 ? 'bg-[#E0E35D]' : (percentage > 10 ? 'bg-[#FF7B01]' : 'bg-[#FF0101]'))));
};

type TimeProgressBarProps = {
    percentage: number;
};

export default function TimeProgressBar({ percentage }: TimeProgressBarProps) {
    return (
        <div className={'absolute left-0 top-0 h-5 lg:h-8 w-full'}>
            <div className={`h-full transition-width ease-linear duration-[990ms] ${calculateColor(percentage)}`} style={{ width: percentage + '%' }}></div>
        </div>
    );
}


