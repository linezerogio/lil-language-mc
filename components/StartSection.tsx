"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useLottie } from "lottie-react";
import darkModeToggle from "../public/darkModeToggle.json";
import Header from './Header';
import useIsMobile from '../hooks/useIsMobile';
import DifficultyBottomSheet from './BottomSheets/DifficultyBottomSheet';
import ModeBottomSheet from './BottomSheets/ModeBottomSheet';
import ModeSelector from './ModeSelector';
import { Difficulty } from '@/types/difficulty';

// Simple cn utility for conditional classNames
function cn(...args: any[]) {
  return args
    .flat()
    .filter(Boolean)
    .join(' ');
}

export default function StartSection() {
  const router = useRouter();
  const isMobile = useIsMobile();

  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [difficultyMenuOpen, setDifficultyMenuOpen] = useState<boolean>(false);
  const [difficultyBottomSheetOpen, setDifficultyBottomSheetOpen] = useState<boolean>(false);

  const handleDifficultyButton = (difficulty: Difficulty) => {
    if (isMobile) {
      setDifficultyBottomSheetOpen(true);
    } else {
      if (difficultyMenuOpen) {
        setDifficulty(difficulty)
      }
      setDifficultyMenuOpen(!difficultyMenuOpen)
    }
  }

  const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
  }

  // Handle easter egg difficulty change from Header
  const handleEasterEggDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
  };

  // Map ZBRA difficulties to base difficulties for routing
  const getRouteDifficulty = (difficulty: Difficulty): string => {
    switch (difficulty) {
      case 'zbra-easy':
        return 'zbra-easy';
      case 'zbra-hard':
        return 'zbra-hard';
      default:
        return difficulty;
    }
  };

  const [newGameMode, setNewGameMode] = useState<"4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode">("4-Bar Mode");
  const [gameModeMenuOpen, setGameModeMenuOpen] = useState<boolean>(false);
  const [gameModeBottomSheetOpen, setGameModeBottomSheetOpen] = useState<boolean>(false);

  const handleGameModeButton = (gameMode: "4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode") => {
    if (isMobile) {
      setGameModeBottomSheetOpen(true);
    } else {
      if (gameModeMenuOpen) {
        setNewGameMode(gameMode)
      }
      setGameModeMenuOpen(!gameModeMenuOpen)
    }
  }

  const handleGameModeSelect = (selectedMode: "4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode") => {
    setNewGameMode(selectedMode);
  }

  // Difficulty options configuration - dynamically include ZBRA modes only if selected
  const difficultyOptions = useMemo(() => {
    const baseOptions = [
      {
        value: "easy" as Difficulty,
        name: "Easy",
        icon: "/Easy.svg",
        description: "Good for beginners or for maximizing rhymes.",
        iconProps: {
            width: 24,
            height: 14.744,
            mdWidth: 40,
            mdHeight: 24.57,
          className: "mr-[10px]"
        }
      },
      {
        value: "medium" as Difficulty,
        name: "Medium", 
        icon: "/Medium.svg",
        description: "Little bit of a challenge to push your limit.",
        iconProps: {
            width: 24,
            height: 14.406,
            mdWidth: 40,
            mdHeight: 24.01,
          className: "mr-[10px]"
        }
      },
      {
        value: "hard" as Difficulty,
        name: "Hard",
        icon: "/Hard.svg", 
        description: "Some of the most difficult words to rhyme with.",
        iconProps: {
            width: 24,
            height: 15.78,
            mdWidth: 40,
            mdHeight: 26.3,
          className: "mr-[10px]"
        }
      }
    ];

    // Add ZBRA modes only if currently selected
    if (difficulty === "zbra-easy") {
      baseOptions.push({
        value: "zbra-easy" as Difficulty,
        name: "ZBRA Easy",
        icon: "/icons/ZBRAEasy.svg",
        description: "Good for beginner Zbra’s so they can finally reach 500 pts maybe.",
        iconProps: {
            width: 24,
            height: 14.744,
            mdWidth: 40,
            mdHeight: 24.57,
          className: "mr-[10px]"
        }
      });
    }

    if (difficulty === "zbra-hard") {
      baseOptions.push({
        value: "zbra-hard" as Difficulty,
        name: "ZBRA Hard",
        icon: "/icons/ZBRAHard.svg",
        description: "Very difficult, only for the trained zbra’s, not just any zbra.",
        iconProps: {
            width: 24,
            height: 15.78,
            mdWidth: 40,
            mdHeight: 26.3,
          className: "mr-[10px]"
        }
      });
    }

    return baseOptions;
  }, [difficulty]);

  // Game mode options configuration
  const gameModeOptions = [
    {
      value: "4-Bar Mode",
      name: "4-Bar Mode",
      icon: "/icons/FourBarMode.svg",
      description: "Write 4 sentences that rhyme with the keyword within the time limit.",
      iconProps: {
          width: 16,
          height: 16,
          mdWidth: 23,
          mdHeight: 24,
        className: "mr-[10px]"
      }
    },
    {
      value: "Rapid Fire Mode",
      name: "Rapid Fire Mode",
      icon: "/icons/RapidFireMode.svg",
      description: "Write 2 sentences that rhyme with each keyword. Complete as many keywords as you can within the time limit.",
      disabled: true,
      iconProps: {
          width: 16,
          height: 16,
          mdWidth: 21.6,
          mdHeight: 27,
        className: "mr-[10px]"
      }
    },
    {
      value: "Endless Mode",
      name: "Endless Mode",
      icon: "/icons/EndlessMode.svg",
      description: "Write as many sentences as possible that rhyme until you run out of lives.",
      disabled: true,
      iconProps: {
          width: 16,
          height: 16,
          mdWidth: 25.15,
          mdHeight: 12.15,
        className: "mr-[10px]"
      }
    }
  ];

  // Wrapper functions for type safety
  const handleDifficultySelectWrapper = (mode: string) => {
    console.log('handleDifficultySelectWrapper', mode);
    handleDifficultySelect(mode as Difficulty);
  };

  const handleDifficultyButtonWrapper = (mode: string) => {
    console.log('handleDifficultyButtonWrapper', mode);
    handleDifficultyButton(mode as Difficulty);
  };

  const handleGameModeSelectWrapper = (mode: string) => {
    handleGameModeSelect(mode as "4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode");
  };

  const handleGameModeButtonWrapper = (mode: string) => {
    handleGameModeButton(mode as "4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode");
  };

  return (
    <div className='h-full flex flex-col justify-between'>
      <div className='px-[30px] lg:px-[100px] pt-[50px]'>
        <Header 
          difficulty={difficulty} 
          onDifficultyChange={handleEasterEggDifficultyChange}
        />
      </div>
      <div className="flex flex-col lg:flex-row justify-center items-center max-w-[2560px] px-[30px] lg:px-[100px] mx-auto flex-1 lg:flex-none pb-[27px] lg:pb-0">
        <div className="flex-col justify-center items-center flex gap-10 flex-1 lg:flex-none">
          <div className="flex-col justify-center items-center flex flex-1 lg:flex-none">
            <div className="text-center font-[termina] font-extrabold text-[22px] lg:text-[75px]">
              CAN YOU FREESTYLE?
            </div>
            <div className="text-center font-[neulis-sans] text-[16px] lg:text-[24px]">
              Write 4 sentences that rhyme with the random keyword given
            </div>
          </div>

          <div className='flex mt-[30px] justify-center lg:h-[73px] w-full lg:w-auto gap-2.5 lg:hidden'>
            <ModeSelector
              options={difficultyOptions}
              selectedMode={difficulty}
              onModeSelect={handleDifficultySelectWrapper}
              onButtonClick={handleDifficultyButtonWrapper}
              onClose={() => setDifficultyMenuOpen(false)}
              isMenuOpen={difficultyMenuOpen}
            />
            <button className="bg-[#5CE2C7] h-[73px] mx-[25px] rounded-[12px] lg:rounded-[25px] text-black text-[18px] w-full lg:text-[25px] font-bold lg:w-[286px] font-[termina] hidden lg:block" onClick={() => router.push(`/freestyle/${getRouteDifficulty(difficulty)}`)}>PLAY</button>
            <ModeSelector
              options={gameModeOptions}
              selectedMode={newGameMode}
              onModeSelect={handleGameModeSelectWrapper}
              onButtonClick={handleGameModeButtonWrapper}
              onClose={() => setGameModeMenuOpen(false)}
              isMenuOpen={gameModeMenuOpen}
            />
          </div>
          <button className="bg-[#5CE2C7] py-[10px] px-[20px] mx-[25px] rounded-[12px] text-black dark:text-white text-[18px] lg:text-[25px] font-bold font-[termina] block lg:hidden w-full" onClick={() => router.push(`/freestyle/${getRouteDifficulty(difficulty)}`)}>PLAY</button>

        </div>
      </div>

      <div className="hidden lg:flex mt-[30px] justify-center h-[73px]">
        {/* Desktop View */}
        <ModeSelector
          options={difficultyOptions}
          selectedMode={difficulty}
          onModeSelect={handleDifficultySelectWrapper}
          onButtonClick={handleDifficultyButtonWrapper}
          onClose={() => setDifficultyMenuOpen(false)}
          isMenuOpen={difficultyMenuOpen}
          className="hidden lg:flex"
        />

        <button
          className="bg-[#5CE2C7] h-[73px] mx-[25px] rounded-[12px] lg:rounded-[25px] text-black text-[18px] lg:text-[25px] font-bold lg:w-[286px] font-[termina] hidden lg:block"
          onClick={() => router.push(`/freestyle/${getRouteDifficulty(difficulty)}`)}
        >
          PLAY
        </button>

        {/* Desktop View */}
        <ModeSelector
          options={gameModeOptions}
          selectedMode={newGameMode}
          onModeSelect={handleGameModeSelectWrapper}
          onButtonClick={handleGameModeButtonWrapper}
          onClose={() => setGameModeMenuOpen(false)}
          isMenuOpen={gameModeMenuOpen}
          className="hidden lg:flex"
        />
      </div>
      <footer className="w-full mx-auto text-center pb-[20px] opacity-50 font-[neulis-sans] font-bold text-[#565757] hidden lg:block">
        ©{new Date().getFullYear()} LineZero Studio. All rights reserved.
      </footer>

      {/* Bottom Sheets for Mobile */}
      <DifficultyBottomSheet
        isOpen={difficultyBottomSheetOpen}
        onClose={() => setDifficultyBottomSheetOpen(false)}
        difficulty={difficulty}
        onDifficultySelect={handleDifficultySelect}
      />

      <ModeBottomSheet
        isOpen={gameModeBottomSheetOpen}
        onClose={() => setGameModeBottomSheetOpen(false)}
        gameMode={newGameMode}
        onGameModeSelect={handleGameModeSelect}
      />
    </div>
  );
}
