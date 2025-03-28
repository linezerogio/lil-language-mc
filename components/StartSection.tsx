"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLottie } from "lottie-react";
import darkModeToggle from "../public/darkModeToggle.json";
import Header from "./Header";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { DifficultySheet } from "./DifficultySheet";
import { ModeSelectSheet } from "./ModeSelectSheet";

export default function StartSection() {
  const router = useRouter();

  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );
  const [difficultyMenuOpen, setDifficultyMenuOpen] = useState<boolean>(false);

  const handleDifficultyButton = (difficulty: "easy" | "medium" | "hard") => {
    if (difficultyMenuOpen) {
      setDifficulty(difficulty);
    }
    setDifficultyMenuOpen(!difficultyMenuOpen);
  };

  const [newGameMode, setNewGameMode] = useState<
    "4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode"
  >("4-Bar Mode");
  const [gameModeMenuOpen, setGameModeMenuOpen] = useState<boolean>(false);

  const handleGameModeButton = (
    gameMode: "4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode"
  ) => {
    if (gameModeMenuOpen) {
      setNewGameMode(gameMode);
    }
    setGameModeMenuOpen(!gameModeMenuOpen);
  };

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="px-[30px] md:px-[100px] pt-[30px] md:pt-[50px]">
        <Header />
      </div>
      <div className="flex justify-center items-center max-w-[2560px] w-full md:px-[100px] mx-auto">
        <div className="flex-col justify-center items-center flex gap-10">
          <div className="flex-col justify-center items-center flex">
            <div className="text-center font-[termina] font-extrabold text-[22px] md:text-[75px]">
              CAN YOU FREESTYLE?
            </div>
            <div className="text-center font-[neulis-sans] text-[16px] md:text-[24px]">
              Write 4 sentences that rhyme with the random keyword given
            </div>
          </div>

          <div className="hidden md:flex mt-[30px] justify-center h-[73px]">
            {/* Desktop View */}
            <div className="hidden md:flex bg-[#FFF] dark:bg-[#1C1E1E] flex-row relative w-[311px] justify-center z-10 rounded-[25px]">
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
              className="bg-[#5CE2C7] h-[73px] mx-[25px] rounded-[12px] md:rounded-[25px] text-black text-[18px] md:text-[25px] font-bold md:w-[286px] font-[termina] hidden md:block"
              onClick={() => router.push(`/freestyle/${difficulty}`)}
            >
              PLAY
            </button>

            {/* Desktop View */}
            <div className="hidden md:flex bg-[#FFF] dark:bg-[#1C1E1E] flex-row relative w-[311px] justify-center z-10 rounded-[25px]">
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
                  onClick={() => {}}
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
                  onClick={() => {}}
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
                    onClick={() => {}}
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
                    onClick={() => {}}
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
        </div>
      </div>
      <div className="flex flex-col md:hidden h-[100px] mb-7 mx-8">
        <div className="flex justify-center h-[42px] gap-[10px]">
          <DifficultySheet
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />

          {/* Mobile View */}
          <ModeSelectSheet
            gameMode={newGameMode}
            setGameMode={setNewGameMode}
          />
        </div>

        <button
          className="bg-[#5CE2C7] h-[43px] w-full rounded-[12px] text-black text-[18px] font-bold font-[termina] block mt-[15px]"
          onClick={() => router.push(`/freestyle/${difficulty}`)}
        >
          PLAY
        </button>
      </div>
      <footer className="w-full mx-auto text-center pb-[20px] opacity-50 font-[neulis-sans] font-bold text-[#565757] hidden md:block">
        ©{new Date().getFullYear()} LineZero Studio. All rights reserved.
      </footer>
    </div>
  );
}
