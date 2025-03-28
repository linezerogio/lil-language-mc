"use client";

import Image from 'next/image';
import { useState } from 'react';
import { BottomSheet } from './bottom-sheet';

type GameModeType = "4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode";

interface ModeSelectSheetProps {
  gameMode: GameModeType;
  setGameMode: (gameMode: GameModeType) => void;
  triggerClassName?: string;
  simple?: boolean;
}

export function ModeSelectSheet({ 
  gameMode, 
  setGameMode,
  triggerClassName = "",
  simple = false 
}: ModeSelectSheetProps) {
  // Control open state of the sheet
  const [open, setOpen] = useState(false);
  
  // Handle selection and close the sheet
  const handleSelection = (selected: GameModeType) => {
    setGameMode(selected);
    // Make sure we close after selection
    setOpen(false);
  };

  // Get display name for the selected mode
  const displayName = gameMode === "4-Bar Mode" ? "4-Bar" : 
                      gameMode === "Rapid Fire Mode" ? "Rapid Fire" : "Endless";

  // Simple trigger for FreestyleForm
  const simpleTrigger = (
    <div className={`flex items-center gap-2 ${triggerClassName}`}>
      <Image 
        src={gameMode === "4-Bar Mode" ? "/icons/FourBarMode.svg" : 
             gameMode === "Rapid Fire Mode" ? "/icons/RapidFireMode.svg" : 
             "/icons/EndlessMode.svg"} 
        height={24} 
        width={24} 
        alt={`${gameMode} Icon`} 
      />
      <span className="text-[14px] font-bold">{displayName}</span>
      <Image 
        src="/icons/ExpandDark.svg" 
        height={16} 
        width={16} 
        alt="Expand" 
        className="dark:hidden"
      />
      <Image 
        src="/icons/Expand.svg" 
        height={16} 
        width={16} 
        alt="Expand" 
        className="hidden dark:block"
      />
    </div>
  );

  // Original trigger for StartSection
  const originalTrigger = (
    <div className={`md:hidden bg-[#FFF] dark:bg-[#1C1E1E] flex flex-row relative w-[calc(100%-70px)] justify-center z-10 rounded-[10px] ${triggerClassName}`}>
      <button type="button" className="justify-between items-center gap-2.5 flex flex-row flex-1 px-[15px]">
        <div className="text-[14px] font-bold tracking-wider flex flex-row mr-auto">
          {gameMode === "4-Bar Mode" && <><Image src="/icons/FourBarMode.svg" height={24} width={23} alt="4-Bar Mode Icon" className='mr-[10px]' /> 4-Bar</>}
          {gameMode === "Rapid Fire Mode" && <><Image src="/icons/RapidFireMode.svg" height={24.01} width={40} alt="Rapid Fire Mode Icon" className='mr-[10px] px-[6.1px]' /> Rapid Fire</>}
          {gameMode === "Endless Mode" && <><Image src="/icons/EndlessMode.svg" height={26.3} width={40} alt="Endless Mode Icon" className='mr-[10px] px-[2.265px]' /> Endless</>}
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
      trigger={simple ? simpleTrigger : originalTrigger}
      title="Select Game Mode"
      open={open}
      onOpenChange={setOpen}
    >
      <div className="flex flex-col gap-6 pt-2">
        <button 
          type="button" 
          onClick={() => handleSelection("4-Bar Mode")} 
          className={"px-5 py-4 justify-center items-start flex flex-col rounded-xl " + (gameMode === "4-Bar Mode" ? "bg-[#191919]" : "")}
        >
          <div className="text-[18px] font-bold tracking-wider flex flex-row items-center text-white">
            <Image src="/icons/FourBarMode.svg" height={24} width={23} alt="4-Bar Mode Icon" className='mr-3 ml-2' /> 4-Bar Mode
          </div>
          <p className='text-[14px] text-[#B2B2B2] text-left pl-2 mt-1'>Write 4 sentences that rhyme with the keyword within the time limit.</p>
        </button>
        <button 
          type="button" 
          className="px-5 py-4 justify-center items-start flex flex-col rounded-xl relative cursor-default"
        >
          <div className="text-[18px] font-bold tracking-wider flex flex-row items-center text-white">
            <Image src="/icons/RapidFireMode.svg" height={27} width={21.6} alt="Rapid Fire Mode Icon" className='mr-3 ml-2' /> Rapid Fire Mode
          </div>
          <p className='text-[14px] text-[#B2B2B2] text-left pl-2 mt-1'>Write 2 sentences that rhyme with each keyword. Complete as many keywords as you can within the time limit.</p>
          <div className="absolute bottom-0 right-0 h-full w-full bg-[#0007] rounded-xl flex flex-col justify-center items-center">
            <Image src="/icons/Lock.svg" height={37.33} width={28.44} alt="Lock Icon" />
            <p className="text-[12px] text-white font-bold">Coming Soon</p>
          </div>
        </button>
        <button 
          type="button" 
          className="px-5 py-4 justify-center items-start flex flex-col rounded-xl relative cursor-default"
        >
          <div className="text-[18px] font-bold tracking-wider flex flex-row items-center text-white">
            <Image src="/icons/EndlessMode.svg" height={12.15} width={25.15} alt="Endless Mode Icon" className='mr-3 ml-2' /> Endless Mode
          </div>
          <p className='text-[14px] text-[#B2B2B2] text-left pl-2 mt-1'>Write as many sentences as possible that rhyme until you run out of lives.</p>
          <div className="absolute bottom-0 right-0 h-full w-full bg-[#0007] rounded-xl flex flex-col justify-center items-center">
            <Image src="/icons/Lock.svg" height={37.33} width={28.44} alt="Lock Icon" />
            <p className="text-[12px] text-white font-bold">Coming Soon</p>
          </div>
        </button>
      </div>
    </BottomSheet>
  );
} 