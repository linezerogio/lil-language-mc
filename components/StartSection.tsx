"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLottie } from "lottie-react";
import darkModeToggle from "../public/darkModeToggle.json";
import Header from './Header';
import useIsMobile from '../hooks/useIsMobile';
import DifficultyBottomSheet from './BottomSheets/DifficultyBottomSheet';
import ModeBottomSheet from './BottomSheets/ModeBottomSheet';

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

  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [difficultyMenuOpen, setDifficultyMenuOpen] = useState<boolean>(false);
  const [difficultyBottomSheetOpen, setDifficultyBottomSheetOpen] = useState<boolean>(false);

  const handleDifficultyButton = (difficulty: "easy" | "medium" | "hard") => {
    if (isMobile) {
      setDifficultyBottomSheetOpen(true);
    } else {
      if (difficultyMenuOpen) {
        setDifficulty(difficulty)
      }
      setDifficultyMenuOpen(!difficultyMenuOpen)
    }
  }

  const handleDifficultySelect = (selectedDifficulty: "easy" | "medium" | "hard") => {
    setDifficulty(selectedDifficulty);
  }

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

  // Helper to get icon size for difficulty (24px width on mobile, original on md+)
  const getDifficultyIconProps = (icon: "easy" | "medium" | "hard") => {
    switch (icon) {
      case "easy":
        return {
          className: "mr-[10px]",
          width: 24,
          height: 14.744,
          mdWidth: 40,
          mdHeight: 24.57,
        };
      case "medium":
        return {
          className: "mr-[10px]",
          width: 24,
          height: 14.406,
          mdWidth: 40,
          mdHeight: 24.01,
        };
      case "hard":
        return {
          className: "mr-[10px]",
          width: 24,
          height: 15.78,
          mdWidth: 40,
          mdHeight: 26.3,
        };
      default:
        return {};
    }
  };

  const getGameModeIconProps = (icon: "4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode") => {
    switch (icon) {
      case "4-Bar Mode":
        return {
          className: "mr-[10px]",
          width: 16,
          height: 16,
          mdWidth: 23,
          mdHeight: 24,
        };
      case "Rapid Fire Mode":
        return {
          className: "mr-[10px]",
          width: 16,
          height: 16,
          mdWidth: 21.6,
          mdHeight: 27,
        };
      case "Endless Mode":
        return {
          className: "mr-[10px]",
          width: 16,
          height: 16,
          mdWidth: 25.15,
          mdHeight: 12.15,
        };
      default:
        return {};
    }
  };

  return (
    <div className='h-full flex flex-col justify-between'>
      <div className='px-[30px] lg:px-[100px] pt-[50px]'>
        <Header />
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
            <div
              className={cn(
                "bg-[#FFF] dark:bg-[#1C1E1E] flex flex-row relative lg:w-[311px] justify-center rounded-[10px] lg:rounded-[25px] flex-1 lg:flex-none py-3 lg:py-0",
                difficultyMenuOpen ? "z-50" : "z-10"
              )}
            >
              {difficulty === "easy" && (!difficultyMenuOpen || isMobile) && <button type="button" onClick={() => handleDifficultyButton("easy")} className={"justify-between items-center gap-2.5 flex flex-row flex-1 px-[15px]"}>
                <div className={"text-[14px] lg:text-[25px] font-bold tracking-wider flex flex-row mr-auto"}>
                  <span className="block lg:hidden">
                    <Image src="/Easy.svg" width={getDifficultyIconProps("easy").width} height={getDifficultyIconProps("easy").height} alt={"Easy Icon"} className={getDifficultyIconProps("easy").className} />
                  </span>
                  <span className="hidden lg:block">
                    <Image src="/Easy.svg" width={getDifficultyIconProps("easy").mdWidth} height={getDifficultyIconProps("easy").mdHeight} alt={"Easy Icon"} className={getDifficultyIconProps("easy").className} />
                  </span>
                  Easy
                </div>
                <div><Image src="/icons/ExpandDark.svg" height={20} width={18} alt={"Expand Arrow"} className='dark:hidden ml-[4px] px-[3px] py-[2px]' /><Image src="/icons/Expand.svg" height={20} width={18} alt={"Expand Arrow"} className='hidden dark:block ml-[4px] px-[3px] py-[2px]' /></div>
              </button>}
              {difficulty === "medium" && (!difficultyMenuOpen || isMobile) && <button type="button" onClick={() => handleDifficultyButton("medium")} className={"justify-between items-center gap-2.5 flex flex-row flex-1 px-[15px]"}>
                <div className={"text-[14px] lg:text-[25px] font-bold tracking-wider flex flex-row mr-auto"}>
                  <span className="block lg:hidden">
                    <Image src="/Medium.svg" width={getDifficultyIconProps("medium").width} height={getDifficultyIconProps("medium").height} alt={"Medium Icon"} className={getDifficultyIconProps("medium").className} />
                  </span>
                  <span className="hidden lg:block">
                    <Image src="/Medium.svg" width={getDifficultyIconProps("medium").mdWidth} height={getDifficultyIconProps("medium").mdHeight} alt={"Medium Icon"} className={getDifficultyIconProps("medium").className} />
                  </span>
                  Medium
                </div>
                <div><Image src="/icons/ExpandDark.svg" height={20} width={18} alt={"Expand Arrow"} className='dark:hidden ml-[4px] px-[3px] py-[2px]' /><Image src="/icons/Expand.svg" height={20} width={18} alt={"Expand Arrow"} className='hidden dark:block ml-[4px] px-[3px] py-[2px]' /></div>
              </button>}
              {difficulty === "hard" && (!difficultyMenuOpen || isMobile) && <button type="button" onClick={() => handleDifficultyButton("hard")} className={"justify-between items-center gap-2.5 flex flex-row flex-1 px-[15px]"}>
                <div className={"text-[14px] lg:text-[25px] font-bold tracking-wider flex flex-row mr-auto"}>
                  <span className="block lg:hidden">
                    <Image src="/Hard.svg" width={getDifficultyIconProps("hard").width} height={getDifficultyIconProps("hard").height} alt={"Hard Icon"} className={getDifficultyIconProps("hard").className} />
                  </span>
                  <span className="hidden lg:block">
                    <Image src="/Hard.svg" width={getDifficultyIconProps("hard").mdWidth} height={getDifficultyIconProps("hard").mdHeight} alt={"Hard Icon"} className={getDifficultyIconProps("hard").className} />
                  </span>
                  Hard
                </div>
                <div><Image src="/icons/ExpandDark.svg" height={20} width={18} alt={"Expand Arrow"} className='dark:hidden ml-[4px] px-[3px] py-[2px]' /><Image src="/icons/Expand.svg" height={20} width={18} alt={"Expand Arrow"} className='hidden dark:block ml-[4px] px-[3px] py-[2px]' /></div>
              </button>}
              {difficultyMenuOpen && !isMobile && <div className="flex flex-col absolute bottom-0 left-0 lg:left-auto bg-[#f4f5f6] dark:bg-[#25292D] w-[311px] rounded-[10px] lg:rounded-[25px] px-3 shadow-[0_4px_40.6px_rgba(0,0,0,0.25)]">
                <button type="button" onClick={() => handleDifficultyButton("easy")} className={"px-[10px] py-[15px] mt-[12px] justify-center items-start flex flex-col rounded-xl " + (difficulty === "easy" ? "bg-[#fff] dark:bg-[#1C1E1E]" : "")}>
                  <div className={"text-[14px] lg:text-[25px] font-bold tracking-wider flex flex-row items-center"}>
                    <span className="block lg:hidden">
                      <Image src="/Easy.svg" width={getDifficultyIconProps("easy").width} height={getDifficultyIconProps("easy").height} alt={"Easy Icon"} className={getDifficultyIconProps("easy").className} />
                    </span>
                    <span className="hidden lg:block">
                      <Image src="/Easy.svg" width={getDifficultyIconProps("easy").mdWidth} height={getDifficultyIconProps("easy").mdHeight} alt={"Easy Icon"} className={getDifficultyIconProps("easy").className} />
                    </span>
                    Easy
                  </div>
                  <p className='text-[12px] text-[#B2B2B2] text-left pl-2'>Good for beginners or for maximizing rhymes.</p>
                </button>
                <button type="button" onClick={() => handleDifficultyButton("medium")} className={"px-[10px] py-[15px] my-[9px] justify-center items-start flex flex-col rounded-xl " + (difficulty === "medium" ? "bg-[#fff] dark:bg-[#1C1E1E]" : "")}>
                  <div className={"text-[14px] lg:text-[25px] font-bold tracking-wider flex flex-row items-center"}>
                    <span className="block lg:hidden">
                      <Image src="/Medium.svg" width={getDifficultyIconProps("medium").width} height={getDifficultyIconProps("medium").height} alt={"Medium Icon"} className={getDifficultyIconProps("medium").className} />
                    </span>
                    <span className="hidden lg:block">
                      <Image src="/Medium.svg" width={getDifficultyIconProps("medium").mdWidth} height={getDifficultyIconProps("medium").mdHeight} alt={"Medium Icon"} className={getDifficultyIconProps("medium").className} />
                    </span>
                    Medium
                  </div>
                  <p className='text-[12px] text-[#B2B2B2] text-left pl-2'>Little bit of a challenge to push your limit.</p>
                </button>
                <button type="button" onClick={() => handleDifficultyButton("hard")} className={"px-[10px] py-[15px] mb-[12px] justify-center items-start flex flex-col rounded-xl " + (difficulty === "hard" ? "bg-[#fff] dark:bg-[#1C1E1E]" : "")}>
                  <div className={"text-[14px] lg:text-[25px] font-bold tracking-wider flex flex-row items-center"}>
                    <span className="block lg:hidden">
                      <Image src="/Hard.svg" width={getDifficultyIconProps("hard").width} height={getDifficultyIconProps("hard").height} alt={"Hard Icon"} className={getDifficultyIconProps("hard").className} />
                    </span>
                    <span className="hidden lg:block">
                      <Image src="/Hard.svg" width={getDifficultyIconProps("hard").mdWidth} height={getDifficultyIconProps("hard").mdHeight} alt={"Hard Icon"} className={getDifficultyIconProps("hard").className} />
                    </span>
                    Hard
                  </div>
                  <p className='text-[12px] text-[#B2B2B2] text-left pl-2'>Some of the most difficult words to rhyme with.</p>
                </button>
              </div>}
            </div>
            <button className="bg-[#5CE2C7] h-[73px] mx-[25px] rounded-[12px] lg:rounded-[25px] text-black text-[18px] w-full lg:text-[25px] font-bold lg:w-[286px] font-[termina] hidden lg:block" onClick={() => router.push(`/freestyle/${difficulty}`)}>PLAY</button>
            <div
              className={cn(
                "bg-[#FFF] dark:bg-[#1C1E1E] flex flex-row relative lg:w-[311px] justify-center rounded-[10px] lg:rounded-[25px] flex-1 lg:flex-none py-3 lg:py-0",
                gameModeMenuOpen ? "z-50" : "z-10"
              )}
            >
              {newGameMode === "4-Bar Mode" && (!gameModeMenuOpen || isMobile) && <button type="button" onClick={() => handleGameModeButton("4-Bar Mode")} className={"justify-between items-center gap-2.5 flex flex-row flex-1 px-[15px] lg:px-[25px]"}>
                <div className={"text-[14px] lg:text-[25px] font-bold tracking-wider flex flex-row mr-auto"}>
                  <span className="block lg:hidden">
                    <Image src="/icons/FourBarMode.svg" height={getGameModeIconProps("4-Bar Mode").height} width={getGameModeIconProps("4-Bar Mode").width} alt={"4-Bar Mode Icon"} className={getGameModeIconProps("4-Bar Mode").className} />
                  </span>
                  <span className="hidden lg:block">
                    <Image src="/icons/FourBarMode.svg" height={getGameModeIconProps("4-Bar Mode").mdHeight} width={getGameModeIconProps("4-Bar Mode").mdWidth} alt={"4-Bar Mode Icon"} className={getGameModeIconProps("4-Bar Mode").className} />
                  </span>
                  4-Bar <span className="hidden lg:block">&nbsp;Mode</span>
                </div>
                <div><Image src="/icons/ExpandDark.svg" height={20} width={18} alt={"Expand Arrow"} className='dark:hidden ml-[4px] px-[3px] py-[2px]' /><Image src="/icons/Expand.svg" height={20} width={18} alt={"Expand Arrow"} className='hidden dark:block ml-[4px] px-[3px] py-[2px]' /></div>
              </button>}
              {newGameMode === "Rapid Fire Mode" && (!gameModeMenuOpen || isMobile) && <button type="button" onClick={() => handleGameModeButton("Rapid Fire Mode")} className={"justify-between items-center gap-2.5 flex flex-row flex-1 px-[5px] lg:px-[25px]"}>
                <div className={"text-[14px] lg:text-[25px] font-bold tracking-wider flex flex-row mr-auto"}>
                  <span className="block lg:hidden">
                    <Image src="/icons/RapidFireMode.svg" height={getGameModeIconProps("Rapid Fire Mode").height} width={getGameModeIconProps("Rapid Fire Mode").width} alt={"Rapid Fire Mode Icon"} className={getGameModeIconProps("Rapid Fire Mode").className} />
                  </span>
                  <span className="hidden lg:block">
                    <Image src="/icons/RapidFireMode.svg" height={getGameModeIconProps("Rapid Fire Mode").mdHeight} width={getGameModeIconProps("Rapid Fire Mode").mdWidth} alt={"Rapid Fire Mode Icon"} className={getGameModeIconProps("Rapid Fire Mode").className} />
                  </span>
                  Rapid Fire <span className="hidden lg:block">&nbsp;Mode</span>
                </div>
                <div><Image src="/icons/ExpandDark.svg" height={20} width={18} alt={"Expand Arrow"} className='dark:hidden ml-[4px] px-[3px] py-[2px]' /><Image src="/icons/Expand.svg" height={20} width={18} alt={"Expand Arrow"} className='hidden dark:block ml-[4px] px-[3px] py-[2px]' /></div>
              </button>}
              {newGameMode === "Endless Mode" && (!gameModeMenuOpen || isMobile) && <button type="button" onClick={() => handleGameModeButton("Endless Mode")} className={"justify-between items-center gap-2.5 flex flex-row flex-1 px-[5px] lg:px-[25px]"}>
                <div className={"text-[14px] lg:text-[25px] font-bold tracking-wider flex flex-row mr-auto"}>
                  <span className="block lg:hidden">
                    <Image src="/icons/EndlessMode.svg" height={getGameModeIconProps("Endless Mode").height} width={getGameModeIconProps("Endless Mode").width} alt={"Endless Mode Icon"} className={getGameModeIconProps("Endless Mode").className} />
                  </span>
                  <span className="hidden lg:block">
                    <Image src="/icons/EndlessMode.svg" height={getGameModeIconProps("Endless Mode").mdHeight} width={getGameModeIconProps("Endless Mode").mdWidth} alt={"Endless Mode Icon"} className={getGameModeIconProps("Endless Mode").className} />
                  </span>
                  Endless <span className="hidden lg:block">&nbsp;Mode</span>
                </div>
                <div><Image src="/icons/ExpandDark.svg" height={20} width={18} alt={"Expand Arrow"} className='dark:hidden ml-[4px] px-[3px] py-[2px]' /><Image src="/icons/Expand.svg" height={20} width={18} alt={"Expand Arrow"} className='hidden dark:block ml-[4px] px-[3px] py-[2px]' /></div>
              </button>}
              {gameModeMenuOpen && !isMobile && <div className="flex flex-col absolute bottom-0 bg-[#f4f5f6] dark:bg-[#25292D] w-[311px] rounded-[10px] lg:rounded-[25px] px-3 shadow-[0_4px_40.6px_rgba(0,0,0,0.25)]">
                <button type="button" onClick={() => handleGameModeButton("4-Bar Mode")} className={"px-[10px] py-[15px] mt-[12px] justify-center items-start flex flex-col rounded-xl " + (newGameMode === "4-Bar Mode" ? "bg-[#fff] dark:bg-[#1C1E1E]" : "")}>
                  <div className={"text-[14px] lg:text-[25px] font-bold tracking-wider flex flex-row items-center"}>
                    <span className="block lg:hidden">
                      <Image src="/icons/FourBarMode.svg" height={getGameModeIconProps("4-Bar Mode").height} width={getGameModeIconProps("4-Bar Mode").width} alt={"4-Bar Mode Icon"} className={getGameModeIconProps("4-Bar Mode").className} />
                    </span>
                    <span className="hidden lg:block">
                      <Image src="/icons/FourBarMode.svg" height={getGameModeIconProps("4-Bar Mode").mdHeight} width={getGameModeIconProps("4-Bar Mode").mdWidth} alt={"4-Bar Mode Icon"} className={getGameModeIconProps("4-Bar Mode").className} />
                    </span>
                    4-Bar <span className="hidden lg:block">&nbsp;Mode</span>
                  </div>
                  <p className='text-[12px] text-[#B2B2B2] text-left pl-2'>Write 4 sentences that rhyme with the keyword within the time limit.</p>
                </button>
                <button type="button" onClick={() => { }} className={"px-[10px] py-[15px] my-[9px] justify-center items-start flex flex-col rounded-xl relative cursor-default"}>
                  <div className={"text-[14px] lg:text-[25px] font-bold tracking-wider flex flex-row items-center"}>
                    <span className="block lg:hidden">
                      <Image src="/icons/RapidFireMode.svg" height={24} width={23} alt={"Rapid Fire Mode Icon"} className='mr-[10px]' />
                    </span>
                    <span className="hidden lg:block">
                      <Image src="/icons/RapidFireMode.svg" height={24} width={23} alt={"Rapid Fire Mode Icon"} className='mr-[10px]' />
                    </span>
                    Rapid Fire <span className="hidden lg:block">&nbsp;Mode</span>
                  </div>
                  <p className='text-[12px] text-[#B2B2B2] text-left pl-2'>Write 2 sentences that rhyme with each keyword. Complete as many keywords as you can within the time limit.</p>
                  <div className="absolute bottom-0 right-0 h-full w-full bg-[#0007] rounded-xl flex flex-col justify-center items-center">
                    <Image src="/icons/Lock.svg" height={37.33} width={28.44} alt={"Lock Icon"} />
                    <p className="text-[12px] text-white font-bold">Coming Soon</p>
                  </div>
                </button>
                <button type="button" onClick={() => { }} className={"px-[10px] py-[15px] mb-[12px] justify-center items-start flex flex-col rounded-xl relative cursor-default"}>
                  <div className={"text-[14px] lg:text-[25px] font-bold tracking-wider flex flex-row items-center"}>
                    <span className="block lg:hidden">
                      <Image src="/icons/EndlessMode.svg" height={12.15} width={25.15} alt={"Endless Mode Icon"} className='mr-[10px]' />
                    </span>
                    <span className="hidden lg:block">
                      <Image src="/icons/EndlessMode.svg" height={12.15} width={25.15} alt={"Endless Mode Icon"} className='mr-[10px]' />
                    </span>
                    Endless <span className="hidden lg:block">&nbsp;Mode</span>
                  </div>
                  <p className='text-[12px] text-[#B2B2B2] text-left pl-2'>Write as many sentences as possible that rhyme until you run out of lives.</p>
                  <div className="absolute bottom-0 right-0 h-full w-full bg-[#0007] rounded-xl flex flex-col justify-center items-center">
                    <Image src="/icons/Lock.svg" height={37.33} width={28.44} alt={"Lock Icon"} />
                    <p className="text-[12px] text-white font-bold">Coming Soon</p>
                  </div>
                </button></div>}
            </div>
          </div>
          <button className="bg-[#5CE2C7] py-[10px] px-[20px] mx-[25px] rounded-[12px] text-black dark:text-white text-[18px] lg:text-[25px] font-bold font-[termina] block lg:hidden w-full" onClick={() => router.push(`/freestyle/${difficulty}`)}>PLAY</button>

        </div>
      </div>

      <div className="hidden lg:flex mt-[30px] justify-center h-[73px]">
        {/* Desktop View */}
        <div className="hidden lg:flex bg-[#FFF] dark:bg-[#1C1E1E] flex-row relative w-[311px] justify-center z-10 rounded-[25px]">
          {difficulty === "easy" && !difficultyMenuOpen && (
            <button
              type="button"
              onClick={() => handleDifficultyButton("easy")}
              className={
                "justify-between items-center gap-2.5 flex flex-row flex-1 px-[15px]"
              }
            >
              <div
                className={
                  "text-[25px] font-bold tracking-wider flex flex-row mr-auto"
                }
              >
                <Image
                  src="/Easy.svg"
                  height={24.57}
                  width={40}
                  alt={"Easy Icon"}
                  className="mr-[10px] px-[5.775px]"
                />{" "}
                Easy
              </div>
              <div>
                <Image
                  src="/icons/ExpandDark.svg"
                  height={20}
                  width={18}
                  alt={"Expand Arrow"}
                  className="dark:hidden ml-[4px] px-[3px] py-[2px]"
                />
                <Image
                  src="/icons/Expand.svg"
                  height={20}
                  width={18}
                  alt={"Expand Arrow"}
                  className="hidden dark:block ml-[4px] px-[3px] py-[2px]"
                />
              </div>
            </button>
          )}
          {difficulty === "medium" && !difficultyMenuOpen && (
            <button
              type="button"
              onClick={() => handleDifficultyButton("medium")}
              className={
                "justify-between items-center gap-2.5 flex flex-row flex-1 px-[15px]"
              }
            >
              <div
                className={
                  "text-[25px] font-bold tracking-wider flex flex-row mr-auto"
                }
              >
                <Image
                  src="/Medium.svg"
                  height={24.01}
                  width={40}
                  alt={"Medium Icon"}
                  className="mr-[10px] px-[6.1px]"
                />{" "}
                Medium
              </div>
              <div>
                <Image
                  src="/icons/ExpandDark.svg"
                  height={20}
                  width={18}
                  alt={"Expand Arrow"}
                  className="dark:hidden ml-[4px] px-[3px] py-[2px]"
                />
                <Image
                  src="/icons/Expand.svg"
                  height={20}
                  width={18}
                  alt={"Expand Arrow"}
                  className="hidden dark:block ml-[4px] px-[3px] py-[2px]"
                />
              </div>
            </button>
          )}
          {difficulty === "hard" && !difficultyMenuOpen && (
            <button
              type="button"
              onClick={() => handleDifficultyButton("hard")}
              className={
                "justify-between items-center gap-2.5 flex flex-row flex-1 px-[15px]"
              }
            >
              <div
                className={
                  "text-[25px] font-bold tracking-wider flex flex-row mr-auto"
                }
              >
                <Image
                  src="/Hard.svg"
                  height={26.3}
                  width={40}
                  alt={"Hard Icon"}
                  className="mr-[10px] px-[2.265px]"
                />{" "}
                Hard
              </div>
              <div>
                <Image
                  src="/icons/ExpandDark.svg"
                  height={20}
                  width={18}
                  alt={"Expand Arrow"}
                  className="dark:hidden ml-[4px] px-[3px] py-[2px]"
                />
                <Image
                  src="/icons/Expand.svg"
                  height={20}
                  width={18}
                  alt={"Expand Arrow"}
                  className="hidden dark:block ml-[4px] px-[3px] py-[2px]"
                />
              </div>
            </button>
          )}
          {difficultyMenuOpen && (
            <div className="flex flex-col absolute bottom-0 bg-[#f4f5f6] dark:bg-[#25292D] w-[311px] rounded-[25px] px-3 shadow-[0_4px_40.6px_rgba(0,0,0,0.25)]">
              <button
                type="button"
                onClick={() => handleDifficultyButton("easy")}
                className={
                  "px-[10px] py-[15px] mt-[12px] justify-center items-start flex flex-col rounded-xl " +
                  (difficulty === "easy"
                    ? "bg-[#fff] dark:bg-[#1C1E1E]"
                    : "")
                }
              >
                <div
                  className={
                    "text-[25px] font-bold tracking-wider flex flex-row items-center"
                  }
                >
                  <Image
                    src="/Easy.svg"
                    height={24.57}
                    width={40}
                    alt={"Easy Icon"}
                    className="mr-[10px] px-[5.775px]"
                  />{" "}
                  Easy
                </div>
                <p className="text-[12px] text-[#B2B2B2] text-left pl-2">
                  Good for beginners or for maximizing rhymes.
                </p>
              </button>
              <button
                type="button"
                onClick={() => handleDifficultyButton("medium")}
                className={
                  "px-[10px] py-[15px] my-[9px] justify-center items-start flex flex-col rounded-xl " +
                  (difficulty === "medium"
                    ? "bg-[#fff] dark:bg-[#1C1E1E]"
                    : "")
                }
              >
                <div
                  className={
                    "text-[25px] font-bold tracking-wider flex flex-row items-center"
                  }
                >
                  <Image
                    src="/Medium.svg"
                    height={24.01}
                    width={40}
                    alt={"Medium Icon"}
                    className="mr-[10px] px-[6.1px]"
                  />{" "}
                  Medium
                </div>
                <p className="text-[12px] text-[#B2B2B2] text-left pl-2">
                  Little bit of a challenge to push your limit.
                </p>
              </button>
              <button
                type="button"
                onClick={() => handleDifficultyButton("hard")}
                className={
                  "px-[10px] py-[15px] mb-[12px] justify-center items-start flex flex-col rounded-xl " +
                  (difficulty === "hard"
                    ? "bg-[#fff] dark:bg-[#1C1E1E]"
                    : "")
                }
              >
                <div
                  className={
                    "text-[25px] font-bold tracking-wider flex flex-row items-center"
                  }
                >
                  <Image
                    src="/Hard.svg"
                    height={26.3}
                    width={40}
                    alt={"Hard Icon"}
                    className="mr-[10px] px-[2.265px]"
                  />{" "}
                  Hard
                </div>
                <p className="text-[12px] text-[#B2B2B2] text-left pl-2">
                  Some of the most difficult words to rhyme with.
                </p>
              </button>
            </div>
          )}
        </div>

        <button
          className="bg-[#5CE2C7] h-[73px] mx-[25px] rounded-[12px] lg:rounded-[25px] text-black text-[18px] lg:text-[25px] font-bold lg:w-[286px] font-[termina] hidden lg:block"
          onClick={() => router.push(`/freestyle/${difficulty}`)}
        >
          PLAY
        </button>

        {/* Desktop View */}
        <div className="hidden lg:flex bg-[#FFF] dark:bg-[#1C1E1E] flex-row relative w-[311px] justify-center z-10 rounded-[25px]">
          {newGameMode === "4-Bar Mode" && !gameModeMenuOpen && (
            <button
              type="button"
              onClick={() => handleGameModeButton("4-Bar Mode")}
              className={
                "justify-between items-center gap-2.5 flex flex-row flex-1 px-[25px]"
              }
            >
              <div
                className={
                  "text-[25px] font-bold tracking-wider flex flex-row mr-auto"
                }
              >
                <Image
                  src="/icons/FourBarMode.svg"
                  height={24}
                  width={23}
                  alt={"4-Bar Mode Icon"}
                  className="mr-[10px]"
                />{" "}
                4-Bar Mode
              </div>
              <div>
                <Image
                  src="/icons/ExpandDark.svg"
                  height={20}
                  width={18}
                  alt={"Expand Arrow"}
                  className="dark:hidden ml-[4px] px-[3px] py-[2px]"
                />
                <Image
                  src="/icons/Expand.svg"
                  height={20}
                  width={18}
                  alt={"Expand Arrow"}
                  className="hidden dark:block ml-[4px] px-[3px] py-[2px]"
                />
              </div>
            </button>
          )}
          {newGameMode === "Rapid Fire Mode" && !gameModeMenuOpen && (
            <button
              type="button"
              onClick={() => { }}
              className={
                "justify-between items-center gap-2.5 flex flex-row flex-1 px-[15px]"
              }
            >
              <div
                className={
                  "text-[25px] font-bold tracking-wider flex flex-row mr-auto"
                }
              >
                <Image
                  src="/icons/RapidFireMode.svg"
                  height={24.01}
                  width={40}
                  alt={"Rapid Fire Mode Icon"}
                  className="mr-[10px] px-[6.1px]"
                />{" "}
                Rapid Fire Mode
              </div>
              <div>
                <Image
                  src="/icons/ExpandDark.svg"
                  height={20}
                  width={18}
                  alt={"Expand Arrow"}
                  className="dark:hidden ml-[4px] px-[3px] py-[2px]"
                />
                <Image
                  src="/icons/Expand.svg"
                  height={20}
                  width={18}
                  alt={"Expand Arrow"}
                  className="hidden dark:block ml-[4px] px-[3px] py-[2px]"
                />
              </div>
            </button>
          )}
          {newGameMode === "Endless Mode" && !gameModeMenuOpen && (
            <button
              type="button"
              onClick={() => { }}
              className={
                "justify-between items-center gap-2.5 flex flex-row flex-1 px-[15px]"
              }
            >
              <div
                className={
                  "text-[25px] font-bold tracking-wider flex flex-row mr-auto"
                }
              >
                <Image
                  src="/icons/EndlessMode.svg"
                  height={26.3}
                  width={40}
                  alt={"Endless Mode Icon"}
                  className="mr-[10px] px-[2.265px]"
                />{" "}
                Endless Mode
              </div>
              <div>
                <Image
                  src="/icons/ExpandDark.svg"
                  height={20}
                  width={18}
                  alt={"Expand Arrow"}
                  className="dark:hidden ml-[4px] px-[3px] py-[2px]"
                />
                <Image
                  src="/icons/Expand.svg"
                  height={20}
                  width={18}
                  alt={"Expand Arrow"}
                  className="hidden dark:block ml-[4px] px-[3px] py-[2px]"
                />
              </div>
            </button>
          )}
          {gameModeMenuOpen && (
            <div className="flex flex-col absolute bottom-0 bg-[#f4f5f6] dark:bg-[#25292D] w-[311px] rounded-[25px] px-3 shadow-[0_4px_40.6px_rgba(0,0,0,0.25)]">
              <button
                type="button"
                onClick={() => handleGameModeButton("4-Bar Mode")}
                className={
                  "px-[10px] py-[15px] mt-[12px] justify-center items-start flex flex-col rounded-xl " +
                  (newGameMode === "4-Bar Mode"
                    ? "bg-[#fff] dark:bg-[#1C1E1E]"
                    : "")
                }
              >
                <div
                  className={
                    "text-[25px] font-bold tracking-wider flex flex-row items-center"
                  }
                >
                  <Image
                    src="/icons/FourBarMode.svg"
                    height={24}
                    width={23}
                    alt={"4-Bar Mode Icon"}
                    className="mr-[18.5px] ml-[8.5px]"
                  />{" "}
                  4-Bar Mode
                </div>
                <p className="text-[12px] text-[#B2B2B2] text-left pl-2">
                  Write 4 sentences that rhyme with the keyword within the
                  time limit.
                </p>
              </button>
              <button
                type="button"
                onClick={() => { }}
                className={
                  "px-[10px] py-[15px] my-[9px] justify-center items-start flex flex-col rounded-xl relative cursor-default"
                }
              >
                <div
                  className={
                    "text-[25px] font-bold tracking-wider flex flex-row items-center"
                  }
                >
                  <Image
                    src="/icons/RapidFireMode.svg"
                    height={27}
                    width={21.6}
                    alt={"Rapid Fire Mode Icon"}
                    className="mr-[18.5px] ml-[8.5px]"
                  />{" "}
                  Rapid Fire Mode
                </div>
                <p className="text-[12px] text-[#B2B2B2] text-left pl-2">
                  Write 2 sentences that rhyme with each keyword. Complete
                  as many keywords as you can within the time limit.
                </p>
                <div className="absolute bottom-0 right-0 h-full w-full bg-[#0007] rounded-xl flex flex-col justify-center items-center">
                  <Image
                    src="/icons/Lock.svg"
                    height={37.33}
                    width={28.44}
                    alt={"Lock Icon"}
                  />
                  <p className="text-[12px] text-white font-bold">
                    Coming Soon
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => { }}
                className={
                  "px-[10px] py-[15px] mb-[12px] justify-center items-start flex flex-col rounded-xl relative cursor-default"
                }
              >
                <div
                  className={
                    "text-[25px] font-bold tracking-wider flex flex-row items-center"
                  }
                >
                  <Image
                    src="/icons/EndlessMode.svg"
                    height={12.15}
                    width={25.15}
                    alt={"Endless Mode Icon"}
                    className="mr-[18.5px] ml-[8.5px]"
                  />{" "}
                  Endless Mode
                </div>
                <p className="text-[12px] text-[#B2B2B2] text-left pl-2">
                  Write as many sentences as possible that rhyme until you
                  run out of lives.
                </p>
                <div className="absolute bottom-0 right-0 h-full w-full bg-[#0007] rounded-xl flex flex-col justify-center items-center">
                  <Image
                    src="/icons/Lock.svg"
                    height={37.33}
                    width={28.44}
                    alt={"Lock Icon"}
                  />
                  <p className="text-[12px] text-white font-bold">
                    Coming Soon
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>
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
