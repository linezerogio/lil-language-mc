'use client'

import React, { useState, useEffect } from 'react';
import { TestRap } from '@/util/testRaps';

type WordRhymeInfo = {
  word: string;
  isRhyme: boolean;
  rhymeType: 'perfect' | 'near' | 'none';
  rhymeGroupId: number | null;
  pronunciation?: string;
};

type LineRhymeInfo = {
  line: string;
  words: WordRhymeInfo[];
};

// Color palette for different rhyme groups
const RHYME_COLORS = [
  '#5CE2C7', // Cyan (perfect rhymes)
  '#5DE36A', // Green (near rhymes)
  '#FFB84D', // Orange
  '#FF6B9D', // Pink
  '#9B59B6', // Purple
  '#3498DB', // Blue
  '#E74C3C', // Red
  '#F39C12', // Orange-yellow
  '#1ABC9C', // Teal
  '#16A085', // Dark teal
];

export default function MultiRhymeView({ rap }: { rap: TestRap }) {
  const [lineInfos, setLineInfos] = useState<LineRhymeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [rhymeGroups, setRhymeGroups] = useState<any[]>([]);

  useEffect(() => {
    async function evaluateRhymes() {
      try {
        const response = await fetch('/api/rhymes/evaluate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lines: rap.lines
          })
        });

        if (!response.ok) {
          throw new Error('Failed to evaluate rhymes');
        }

        const data = await response.json();
        setLineInfos(data.lineInfos);
        setRhymeGroups(data.rhymeGroups || []);
      } catch (error) {
        console.error('Error evaluating rhymes:', error);
      } finally {
        setLoading(false);
      }
    }

    evaluateRhymes();
  }, [rap]);

  const renderLineWithHighlights = (lineInfo: LineRhymeInfo) => {
    // Split line into words, preserving spaces
    const parts = lineInfo.line.split(/(\s+)/);
    let wordIndex = 0;

    return (
      <div className="text-[14px] lg:text-2xl py-[15px] lg:pt-[24px] pr-[15px] lg:pr-[40px] text-black dark:text-[#E1E3E3] dark:bg-[#1C1E1E] lg:leading-snug pl-[50px] lg:pl-[60px]">
        {parts.map((part, index) => {
          // If it's whitespace, render as-is
          if (/^\s+$/.test(part)) {
            return <span key={index}>{part}</span>;
          }

          // It's a word - clean it and match with word data
          const cleanWord = part.replace(/[^a-zA-Z0-9]/g, '');
          
          // Match by position (words are processed in order by getRhymeData)
          const wordInfo = wordIndex < lineInfo.words.length 
            ? lineInfo.words[wordIndex] 
            : undefined;

          // Verify the word matches (handle cases where punctuation might affect matching)
          if (wordInfo && wordInfo.word.toLowerCase() !== cleanWord.toLowerCase()) {
            // Try to find by content if position doesn't match
            const found = lineInfo.words.find(w => 
              w.word.toLowerCase() === cleanWord.toLowerCase()
            );
            if (found) {
              wordIndex++;
              if (!found.isRhyme || found.rhymeGroupId === null) {
                return <span key={index}>{part}</span>;
              }
              const colorIndex = found.rhymeGroupId % RHYME_COLORS.length;
              const bgColor = RHYME_COLORS[colorIndex];
              return (
                <span
                  key={index}
                  className="px-1 rounded font-semibold text-black"
                  style={{ backgroundColor: bgColor }}
                  title={`${found.rhymeType} rhyme (group ${found.rhymeGroupId})`}
                >
                  {part}
                </span>
              );
            }
            return <span key={index}>{part}</span>;
          }

          wordIndex++;

          if (!wordInfo || !wordInfo.isRhyme || wordInfo.rhymeGroupId === null) {
            return <span key={index}>{part}</span>;
          }

          // Get color based on rhyme group ID
          const colorIndex = wordInfo.rhymeGroupId % RHYME_COLORS.length;
          const bgColor = RHYME_COLORS[colorIndex];
          const isPerfect = wordInfo.rhymeType === 'perfect';

          return (
            <span
              key={index}
              className="px-1 rounded font-semibold text-black"
              style={{ backgroundColor: bgColor }}
              title={`${wordInfo.rhymeType} rhyme (group ${wordInfo.rhymeGroupId})`}
            >
              {part}
            </span>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-[#565757] dark:text-[#B2B2B2]">Loading rhyme analysis...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">{rap.title}</h2>
      {rhymeGroups.length > 0 && (
        <div className="mb-4 text-sm text-[#565757] dark:text-[#B2B2B2]">
          Found {rhymeGroups.length} rhyme group{rhymeGroups.length !== 1 ? 's' : ''} with {rhymeGroups.reduce((sum, g) => sum + g.wordCount, 0)} rhyming words
        </div>
      )}
      <div className="rounded-[12px] lg:rounded-[25px] overflow-hidden border border-[#F5F5F5] dark:border-[#343737]">
        {lineInfos.map((lineInfo, index) => (
          <div
            key={index}
            className={
              index === 0
                ? "rounded-t-[12px] lg:rounded-t-[25px] border-b-2 border-[#F5F5F5] dark:border-[#343737]"
                : index === lineInfos.length - 1
                ? "rounded-b-[12px] lg:rounded-b-[25px]"
                : "border-b-2 border-[#F5F5F5] dark:border-[#343737]"
            }
          >
            <div className="flex items-start relative">
              <span className="rounded-full bg-[#5DE3C8] absolute w-6 h-6 text-center pt-[1.5px] mt-[15px] lg:mt-[26px] ml-[15px] lg:ml-[25px] dark:text-black text-sm font-semibold">
                {index + 1}
              </span>
              {renderLineWithHighlights(lineInfo)}
            </div>
          </div>
        ))}
      </div>
      {rhymeGroups.length > 0 && (
        <div className="mt-4 text-xs text-[#565757] dark:text-[#B2B2B2]">
          <div className="mb-2 font-semibold">Rhyme Groups:</div>
          <div className="flex flex-wrap gap-3">
            {rhymeGroups.map((group) => {
              const colorIndex = group.id % RHYME_COLORS.length;
              const bgColor = RHYME_COLORS[colorIndex];
              return (
                <div key={group.id} className="flex items-center gap-2">
                  <span 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: bgColor }}
                  ></span>
                  <span>Group {group.id} ({group.wordCount} words, {group.rhymeType})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

