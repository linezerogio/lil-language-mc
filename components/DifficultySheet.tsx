"use client";

import Image from 'next/image';
import { useState } from 'react';
import { BottomSheet } from './bottom-sheet';

type DifficultyType = "easy" | "medium" | "hard";

interface DifficultySheetProps {
  difficulty: DifficultyType;
  setDifficulty: (difficulty: DifficultyType) => void;
}

export function DifficultySheet({ difficulty, setDifficulty }: DifficultySheetProps) {
  // Control open state of the sheet
  const [open, setOpen] = useState(false);
  
  // Handle selection and close the sheet
  const handleSelection = (selected: DifficultyType) => {
    setDifficulty(selected);
    setOpen(false);
  };

  const trigger = (
    <div className="md:hidden bg-[#FFF] dark:bg-[#1C1E1E] flex flex-row relative w-[calc(100%-70px)] justify-center z-10 rounded-[10px]">
      <button type="button" className="justify-between items-center gap-2.5 flex flex-row flex-1 px-[5px]">
        <div className="text-[14px] font-bold tracking-wider flex flex-row mr-auto">
          {difficulty === "easy" && <><Image src="/Easy.svg" height={24.57} width={40} alt="Easy Icon" className='mr-[10px] px-[5.775px]' /> Easy</>}
          {difficulty === "medium" && <><Image src="/Medium.svg" height={24.01} width={40} alt="Medium Icon" className='mr-[10px] px-[6.1px]' /> Medium</>}
          {difficulty === "hard" && <><Image src="/Hard.svg" height={26.3} width={40} alt="Hard Icon" className='mr-[10px] px-[2.265px]' /> Hard</>}
        </div>
        <div>
          <Image src="/icons/ExpandDark.svg" height={20} width={18} alt="Expand Arrow" className='dark:hidden ml-[4px] px-[3px] py-[2px]' />
          <Image src="/icons/Expand.svg" height={20} width={18} alt="Expand Arrow" className='hidden dark:block ml-[4px] px-[3px] py-[2px]' />
        </div>
      </button>
    </div>
  );

  return (
    <BottomSheet 
      trigger={trigger}
      title="Select Difficulty"
      open={open}
      onOpenChange={setOpen}
    >
      <div className="flex flex-col gap-6 pt-2">
        <button 
          type="button" 
          onClick={() => handleSelection("easy")} 
          className={"px-5 py-4 justify-center items-start flex flex-col rounded-xl " + (difficulty === "easy" ? "bg-[#191919]" : "")}
        >
          <div className="text-[18px] font-bold tracking-wider flex flex-row items-center text-white">
            <Image src="/Easy.svg" height={24.57} width={40} alt="Easy Icon" className='mr-3 px-[5.775px]' /> Easy
          </div>
          <p className='text-[14px] text-[#B2B2B2] text-left pl-2 mt-1'>Good for beginners or for maximizing rhymes.</p>
        </button>
        <button 
          type="button" 
          onClick={() => handleSelection("medium")} 
          className={"px-5 py-4 justify-center items-start flex flex-col rounded-xl " + (difficulty === "medium" ? "bg-[#191919]" : "")}
        >
          <div className="text-[18px] font-bold tracking-wider flex flex-row items-center text-white">
            <Image src="/Medium.svg" height={24.01} width={40} alt="Medium Icon" className='mr-3 px-[6.1px]' /> Medium
          </div>
          <p className='text-[14px] text-[#B2B2B2] text-left pl-2 mt-1'>Little bit of a challenge to push your limit.</p>
        </button>
        <button 
          type="button" 
          onClick={() => handleSelection("hard")} 
          className={"px-5 py-4 justify-center items-start flex flex-col rounded-xl " + (difficulty === "hard" ? "bg-[#191919]" : "")}
        >
          <div className="text-[18px] font-bold tracking-wider flex flex-row items-center text-white">
            <Image src="/Hard.svg" height={26.3} width={40} alt="Hard Icon" className='mr-3 px-[2.265px]' /> Hard
          </div>
          <p className='text-[14px] text-[#B2B2B2] text-left pl-2 mt-1'>Some of the most difficult words to rhyme with.</p>
        </button>
      </div>
    </BottomSheet>
  );
} 