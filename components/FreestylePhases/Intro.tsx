'use client'

import React from 'react';

type IntroProps = {
    countdownTimeLeft: number;
};

export default function Intro({ countdownTimeLeft }: IntroProps) {
    return (
        <div className="absolute top-[90px] left-0 right-0 flex justify-center items-center max-w-[1920px] px-[100px] mx-auto">
            <div className="flex-col justify-center items-center gap-10 flex">
                <div className="flex-col justify-center items-center flex">
                    <div className="text-center">
                        <span className="text-[211px] font-bold tracking-[3.05px]">{countdownTimeLeft}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}


