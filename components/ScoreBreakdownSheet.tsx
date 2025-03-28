"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import ScoreBreakdown from '@/types/breakdown';
import LinearProgressBar from './LinearProgressBar';
import { BottomSheet } from './bottom-sheet';

interface ScoreBreakdownSheetProps {
  scoreBreakdown: ScoreBreakdown;
  trigger: React.ReactNode;
  word: string;
  difficulty: string;
  lines: string[];
}

type Modifier = {
  text: string;
  positive: boolean;
  number: number;
}

interface MetricCardProps {
  title: string;
  icon: string;
  percentage: number;
  modifiers: Modifier[];
  expanded: boolean;
  onToggleExpand: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  icon, 
  percentage, 
  modifiers,
  expanded,
  onToggleExpand
}) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  return (
    <div 
      className="bg-[#FFFFFF] dark:bg-[#1B1C1D] p-4 rounded-xl flex flex-col cursor-pointer"
      onClick={onToggleExpand}
    >
      <div className="flex items-center mb-2">
        <Image 
          src={icon} 
          width={20} 
          height={20} 
          alt={`${title} Icon`}
          className="mr-2"
        />
        <span className="text-[#1B1C1D] dark:text-[#F5F5F5] text-sm font-semibold">{title}</span>
        <Image
          src="/icons/Expand.svg"
          width={7.5}
          height={11.78}
          alt="Expand"
          className="ml-auto"
        />
      </div>
      
      <LinearProgressBar 
        progress={percentage} 
        height={6} 
        strokeWidth={6} 
        activeColor="#5CE2C7" 
        inactiveColor={darkMode ? '#25292D' : '#F5F5F5'} 
      />
      
      {expanded && (
        <div className="mt-3 space-y-1.5">
          {modifiers.filter(mod => mod.number > 0).map((mod, index) => (
            <div key={index} className="flex items-center text-xs">
              <span className={`mr-1.5 ${mod.positive ? 'text-[#5CE2C7]' : 'text-red-500'} font-medium`}>
                {mod.positive ? '+' : '–'}
              </span>
              <span className="text-[#565757] dark:text-[#B2B2B2]">{mod.text}</span>
              {mod.number > 1 && (
                <span className={`ml-1 ${mod.positive ? 'text-[#5CE2C7]' : 'text-red-500'}`}>
                  ({mod.number})
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ScoreBreakdownSheet: React.FC<ScoreBreakdownSheetProps> = ({ 
  scoreBreakdown, 
  trigger,
  word,
  difficulty,
  lines
}) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const { rhymeBreakdown, flowBreakdown, lengthBreakdown, speedBreakdown } = scoreBreakdown;
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const rhymeModifiers: Modifier[] = [
    { text: "Ended with punchline", positive: true, number: rhymeBreakdown.endedWithPunchline ? 1 : 0 },
    { text: "Perfect Rhymes", positive: true, number: rhymeBreakdown.perfectRhymes },
    { text: "Near Rhymes", positive: true, number: rhymeBreakdown.nearRhymes },
    { text: "Typos", positive: false, number: rhymeBreakdown.typos },
    { text: "Repeat words", positive: false, number: rhymeBreakdown.repeatedWords }
  ];

  const flowModifiers: Modifier[] = [
    { text: "Syllable match", positive: true, number: flowBreakdown.syllableMatch },
    { text: "Rhyme Placement", positive: true, number: flowBreakdown.rhymePlacement },
    { text: "Syllable difference", positive: false, number: flowBreakdown.syllableDifference }
  ];

  const lengthModifiers: Modifier[] = [
    { text: "Long Sentences", positive: true, number: lengthBreakdown.longSentences },
    { text: "Mid Sentences", positive: true, number: lengthBreakdown.midSentences },
    { text: "Short sentences", positive: false, number: lengthBreakdown.shortSentences }
  ];

  const speedModifiers: Modifier[] = [
    { text: "Time Remaining", positive: true, number: speedBreakdown.timeRemaining },
    { text: "Ran out of time", positive: false, number: speedBreakdown.ranOutOfTime ? 1 : 0 }
  ];
  
  return (
    <BottomSheet
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      contentClassName="max-h-[80vh] p-0"
      header={
        <div className="sticky top-0 bg-[#F5F5F5] dark:bg-[#25292D] z-10 pt-3 pb-4">
          {/* Notch */}
          <div className="w-12 h-1 bg-gray-500 rounded-full mx-auto mb-4" />
          
          {/* Mode and Word text */}
          <div className="text-center text-[#565757] dark:text-[#B2B2B2] text-xs font-medium px-4">
            4-Bar Mode | {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} "{word.charAt(0).toUpperCase() + word.slice(1)}"
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        
        {/* Scrollable content */}
        <div className="overflow-y-auto px-4 pb-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <MetricCard 
              title="Rhyming" 
              icon="/icons/Rhyme.svg" 
              percentage={rhymeBreakdown.percentage * 100}
              modifiers={rhymeModifiers}
              expanded={expanded}
              onToggleExpand={toggleExpand}
            />
            <MetricCard 
              title="Flow" 
              icon="/icons/Flow.svg" 
              percentage={flowBreakdown.percentage * 100}
              modifiers={flowModifiers}
              expanded={expanded}
              onToggleExpand={toggleExpand}
            />
            <MetricCard 
              title="Length" 
              icon="/icons/Length.svg" 
              percentage={lengthBreakdown.percentage * 100}
              modifiers={lengthModifiers}
              expanded={expanded}
              onToggleExpand={toggleExpand}
            />
            <MetricCard 
              title="Speed" 
              icon="/icons/Speed.svg" 
              percentage={speedBreakdown.percentage * 100}
              modifiers={speedModifiers}
              expanded={expanded}
              onToggleExpand={toggleExpand}
            />
          </div>
          
          {/* Lyrics display */}
          <div className="bg-[#FFFFFF] dark:bg-[#1B1C1D] rounded-xl">
            {lines.map((line, index) => (
              <div key={index} className="relative flex items-center border-b border-[#F5F5F5] dark:border-[#25292D] last:border-0">
                <div className="flex-shrink-0 w-10 flex justify-center items-center">
                  <div className="rounded-full bg-[#5CE2C7] text-[#1B1C1D] font-semibold w-6 h-6 flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                </div>
                <p className="py-4 pr-4 text-[#1B1C1D] dark:text-[#F5F5F5] text-sm leading-tight">
                  {line}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}; 