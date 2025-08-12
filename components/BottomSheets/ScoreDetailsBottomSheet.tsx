import React, { useEffect, useRef, useState } from "react";
import { Sheet, SheetRef } from "react-modal-sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";
import ScoreBreakdown from "@/types/breakdown";
import LinearProgressBar from "../LinearProgressBar";

interface ScoreDetailsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  scoreBreakdown?: ScoreBreakdown;
  lines?: string[];
  mode?: string;
  difficulty?: string;
  targetWord?: string;
}

const ScoreDetailsBottomSheet: React.FC<ScoreDetailsBottomSheetProps> = ({
  isOpen,
  onClose,
  scoreBreakdown,
  lines = [],
  mode = "4-Bar Mode",
  difficulty = "Easy",
  targetWord = "Sword",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);

    mediaQuery.addEventListener('change', handleChange);  
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Default values if scoreBreakdown is not provided
  const defaultBreakdown = {
    rhymeBreakdown: {
      percentage: 0.8,
      endedWithPunchline: true,
      perfectRhymes: 1,
      nearRhymes: 2,
      typos: 2,
      repeatedWords: 2,
    },
    flowBreakdown: {
      percentage: 0.9,
      syllableMatch: 1,
      rhymePlacement: 1,
      syllableDifference: 0,
    },
    lengthBreakdown: {
      percentage: 0.75,
      longSentences: 2,
      midSentences: 2,
      shortSentences: 1,
    },
    speedBreakdown: { percentage: 0.6, timeRemaining: 22, ranOutOfTime: true },
  };

  const breakdown = scoreBreakdown || defaultBreakdown;
  const { rhymeBreakdown, flowBreakdown, lengthBreakdown, speedBreakdown } =
    breakdown;

  // Sample lines if not provided
  const [showInfo, setShowInfo] = useState(false);
  const displayLines =
    lines.length > 0
      ? lines
      : [
        "Rest assured, the best is here in the flesh, and that's for sure",
        "The rest should wear 'em a vest, I'm set for war",
        "I send niggas to address the Lord",
        "Same flow that put your neck to sword",
      ];

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[530]}
    >
      <Sheet.Container
        className="!bg-[#1B1C1D] rounded-t-[25px]"
      >
        <Sheet.Header className="!bg-[#f4f5f6] dark:!bg-[#25292D]" />

        <Sheet.Content>
          <div className="flex flex-col gap-5 !bg-[#f4f5f6] dark:!bg-[#25292D] px-5 pb-safe">
            {/* Header with mode/difficulty info and expand button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 justify-center">
                <h3 className="text-[#565757] dark:text-[#B2B2B2] text-lg font-medium">
                  {mode} | {difficulty[0].toUpperCase() + difficulty.slice(1)}{" "}
                  &ldquo;
                  {targetWord.charAt(0).toUpperCase() + targetWord.slice(1)}
                  &rdquo;
                </h3>
                <button className="w-4 h-4" onClick={() => setShowInfo((v) => !v)}>
                  <Image
                    src={showInfo ? "/icons/Close.svg" : "/icons/Info.svg"}
                    width={16}
                    height={16}
                    alt={showInfo ? "Close" : "Info"}
                  />
                </button>
              </div>
            </div>
            <Dialog open={showInfo} onOpenChange={setShowInfo}>
              <DialogContent className="w-[90vw] max-w-[950px] rounded-[25px] p-6">
                <button
                  className="absolute top-5 right-5 w-[20px] h-[20px]"
                  onClick={() => setShowInfo(false)}
                  aria-label="Close"
                >
                  <Image src="/icons/Close.svg" width={20} height={20} alt="Close" />
                </button>
                <div className="grid grid-cols-2 gap-x-10 gap-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Image src="/icons/Rhyme.svg" width={24} height={24} alt="Rhyming" />
                      <span className="text-black dark:text-white text-xl font-semibold">Rhyming</span>
                    </div>
                    <p className="text-[#565757] dark:text-[#B2B2B2] text-base leading-relaxed">
                      The more exact and near rhymes you end your sentences with, the higher this score.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Image src="/icons/Flow.svg" width={24} height={24} alt="Flow" />
                      <span className="text-black dark:text-white text-xl font-semibold">Flow</span>
                    </div>
                    <p className="text-[#565757] dark:text-[#B2B2B2] text-base leading-relaxed">
                      Based on how often you have exact or near matching syllables.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Image src="/icons/Length.svg" width={24} height={24} alt="Length" />
                      <span className="text-black dark:text-white text-xl font-semibold">Length</span>
                    </div>
                    <p className="text-[#565757] dark:text-[#B2B2B2] text-base leading-relaxed">
                      The longer each of your sentences are, the higher this score will be.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Image src="/icons/Speed.svg" width={24} height={24} alt="Speed" />
                      <span className="text-black dark:text-white text-xl font-semibold">Speed</span>
                    </div>
                    <p className="text-[#565757] dark:text-[#B2B2B2] text-base leading-relaxed">
                      The more time remaining, the higher this score is.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <div className="overflow-y-auto max-h-[calc(467px)] pb-20 flex flex-col gap-5">
              {!isExpanded ? (
                /* Collapsed View - 4-card grid */
                <div className="grid grid-cols-2 gap-5">
                  {/* Rhyme Card */}
                  <div
                    className="bg-white dark:bg-[#1B1C1D] rounded-lg p-4"
                    onClick={() => setIsExpanded(true)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Image
                        src="/icons/Rhyme.svg"
                        width={20}
                        height={20}
                        alt="Rhyme"
                      />
                      <span className="text-[#1B1C1D] dark:text-white font-medium">Rhyming</span>

                      <div>
                        <Image
                          src="/icons/ExpandDark.svg"
                          height={16}
                          width={16}
                          alt={"Expand Arrow"}
                          className="dark:hidden ml-[4px] px-[3px] py-[2px]"
                        />
                        <Image
                          src="/icons/Expand.svg"
                          height={16}
                          width={16}
                          alt={"Expand Arrow"}
                          className="hidden dark:block ml-[4px] px-[3px] py-[2px]"
                        />
                      </div>
                    </div>
                    <LinearProgressBar
                      progress={rhymeBreakdown.percentage * 100}
                      height={8}
                      strokeWidth={8}
                      activeColor="#5CE2C7"
                      inactiveColor={darkMode ? "#343737" : "#F5F5F5"}
                    />
                  </div>

                  {/* Flow Card */}
                  <div
                    className="bg-white dark:bg-[#1B1C1D] rounded-lg p-4"
                    onClick={() => setIsExpanded(true)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Image
                        src="/icons/Flow.svg"
                        width={20}
                        height={20}
                        alt="Flow"
                      />
                      <span className="text-[#1B1C1D] dark:text-white font-medium">Flow</span>

                      <div>
                        <Image
                          src="/icons/ExpandDark.svg"
                          height={16}
                          width={16}
                          alt={"Expand Arrow"}
                          className="dark:hidden ml-[4px] px-[3px] py-[2px]"
                        />
                        <Image
                          src="/icons/Expand.svg"
                          height={16}
                          width={16}
                          alt={"Expand Arrow"}
                          className="hidden dark:block ml-[4px] px-[3px] py-[2px]"
                        />
                      </div>
                    </div>
                    <LinearProgressBar
                      progress={flowBreakdown.percentage * 100}
                      height={8}
                      strokeWidth={8}
                      activeColor="#5CE2C7"
                      inactiveColor={darkMode ? "#343737" : "#F5F5F5"}
                    />
                  </div>

                  {/* Length Card */}
                  <div
                    className="bg-white dark:bg-[#1B1C1D] rounded-lg p-4"
                    onClick={() => setIsExpanded(true)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Image
                        src="/icons/Length.svg"
                        width={20}
                        height={20}
                        alt="Length"
                      />
                      <span className="text-[#1B1C1D] dark:text-white font-medium">Length</span>

                      <div>
                        <Image
                          src="/icons/ExpandDark.svg"
                          height={16}
                          width={16}
                          alt={"Expand Arrow"}
                          className="dark:hidden ml-[4px] px-[3px] py-[2px]"
                        />
                        <Image
                          src="/icons/Expand.svg"
                          height={16}
                          width={16}
                          alt={"Expand Arrow"}
                          className="hidden dark:block ml-[4px] px-[3px] py-[2px]"
                        />
                      </div>
                    </div>
                    <LinearProgressBar
                      progress={lengthBreakdown.percentage * 100}
                      height={8}
                      strokeWidth={8}
                      activeColor="#5CE2C7"
                      inactiveColor={darkMode ? "#343737" : "#F5F5F5"}
                    />
                  </div>

                  {/* Speed Card */}
                  <div
                    className="bg-white dark:bg-[#1B1C1D] rounded-lg p-4"
                    onClick={() => setIsExpanded(true)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Image
                        src="/icons/Speed.svg"
                        width={20}
                        height={20}
                        alt="Speed"
                      />
                      <span className="text-[#1B1C1D] dark:text-white font-medium">Speed</span>

                      <div>
                        <Image
                          src="/icons/ExpandDark.svg"
                          height={16}
                          width={16}
                          alt={"Expand Arrow"}
                          className="dark:hidden ml-[4px] px-[3px] py-[2px]"
                        />
                        <Image
                          src="/icons/Expand.svg"
                          height={16}
                          width={16}
                          alt={"Expand Arrow"}
                          className="hidden dark:block ml-[4px] px-[3px] py-[2px]"
                        />
                      </div>
                    </div>
                    <LinearProgressBar
                      progress={speedBreakdown.percentage * 100}
                      height={8}
                      strokeWidth={8}
                      activeColor="#5CE2C7"
                      inactiveColor={darkMode ? "#343737" : "#F5F5F5"}
                    />
                  </div>
                </div>
              ) : (
                /* Expanded View */
                <div className="space-y-6">
                  {/* Detailed Score Breakdown Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Rhyme Section */}
                    <div
                      className="bg-white dark:bg-[#1B1C1D] rounded-lg p-4"
                      onClick={() => setIsExpanded(false)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Image
                          src="/icons/Rhyme.svg"
                          width={20}
                          height={20}
                          alt="Rhyme"
                        />
                        <span className="text-[#1B1C1D] dark:text-white font-medium">Rhyming</span>
                        <div>
                          <Image
                            src="/icons/ExpandDark.svg"
                            height={16}
                            width={16}
                            alt={"Expand Arrow"}
                            className="dark:hidden ml-[4px] px-[3px] py-[2px]"
                          />
                          <Image
                            src="/icons/Expand.svg"
                            height={16}
                            width={16}
                            alt={"Expand Arrow"}
                            className="hidden dark:block ml-[4px] px-[3px] py-[2px]"
                          />
                        </div>
                      </div>
                      <LinearProgressBar
                        progress={rhymeBreakdown.percentage * 100}
                        height={8}
                        strokeWidth={8}
                        activeColor="#5CE2C7"
                        inactiveColor={darkMode ? "#343737" : "#F5F5F5"}
                      />
                      <div className="mt-4 space-y-2">
                        {rhymeBreakdown.endedWithPunchline && (
                          <div className="flex items-center gap-2">
                            <Image
                              src="/icons/Positive.svg"
                              width={12}
                              height={12}
                              alt="+"
                            />
                            <span className="text-[#B2B2B2] text-xs">
                              Ended with punchline
                            </span>
                          </div>
                        )}
                        {rhymeBreakdown.perfectRhymes > 0 && (
                          <div className="flex items-center gap-2">
                            <Image
                              src="/icons/Positive.svg"
                              width={12}
                              height={12}
                              alt="+"
                            />
                            <span className="text-[#B2B2B2] text-xs">
                              Perfect Rhyme ({rhymeBreakdown.perfectRhymes})
                            </span>
                          </div>
                        )}
                        {rhymeBreakdown.nearRhymes > 0 && (
                          <div className="flex items-center gap-2">
                            <Image
                              src="/icons/Positive.svg"
                              width={12}
                              height={12}
                              alt="+"
                            />
                            <span className="text-[#B2B2B2] text-xs">
                              Near Rhymes ({rhymeBreakdown.nearRhymes})
                            </span>
                          </div>
                        )}
                        {rhymeBreakdown.typos > 0 && (
                          <div className="flex items-center gap-2">
                            <Image
                              src="/icons/Negative.svg"
                              width={12}
                              height={12}
                              alt="-"
                            />
                            <span className="text-[#B2B2B2] text-xs">
                              Typos ({rhymeBreakdown.typos})
                            </span>
                          </div>
                        )}
                        {rhymeBreakdown.repeatedWords > 0 && (
                          <div className="flex items-center gap-2">
                            <Image
                              src="/icons/Negative.svg"
                              width={12}
                              height={12}
                              alt="-"
                            />
                            <span className="text-[#B2B2B2] text-xs">
                              Repeat words ({rhymeBreakdown.repeatedWords})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Flow Section */}
                    <div
                      className="bg-white dark:bg-[#1B1C1D] rounded-lg p-4"
                      onClick={() => setIsExpanded(false)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Image
                          src="/icons/Flow.svg"
                          width={20}
                          height={20}
                          alt="Flow"
                        />
                        <span className="text-[#1B1C1D] dark:text-white font-medium">Flow</span>

                        <div>
                          <Image
                            src="/icons/ExpandDark.svg"
                            height={16}
                            width={16}
                            alt={"Expand Arrow"}
                            className="dark:hidden ml-[4px] px-[3px] py-[2px]"
                          />

                          <div>
                            <Image
                              src="/icons/ExpandDark.svg"
                              height={16}
                              width={16}
                              alt={"Expand Arrow"}
                              className="dark:hidden ml-[4px] px-[3px] py-[2px]"
                            />
                            <Image
                              src="/icons/Expand.svg"
                              height={16}
                              width={16}
                              alt={"Expand Arrow"}
                              className="hidden dark:block ml-[4px] px-[3px] py-[2px]"
                            />
                          </div>
                        </div>
                      </div>
                      <LinearProgressBar
                        progress={flowBreakdown.percentage * 100}
                        height={8}
                        strokeWidth={8}
                        activeColor="#5CE2C7"
                        inactiveColor={darkMode ? "#343737" : "#F5F5F5"}
                      />
                      <div className="mt-4 space-y-2">
                        {flowBreakdown.syllableMatch > 0 && (
                          <div className="flex items-center gap-2">
                            <Image
                              src="/icons/Positive.svg"
                              width={12}
                              height={12}
                              alt="+"
                            />
                            <span className="text-[#B2B2B2] text-xs">
                              Syllable match
                            </span>
                          </div>
                        )}
                        {flowBreakdown.rhymePlacement > 0 && (
                          <div className="flex items-center gap-2">
                            <Image
                              src="/icons/Positive.svg"
                              width={12}
                              height={12}
                              alt="+"
                            />
                            <span className="text-[#B2B2B2] text-xs">
                              Rhyme Placement
                            </span>
                          </div>
                        )}
                        {flowBreakdown.syllableDifference > 0 && (
                          <div className="flex items-center gap-2">
                            <Image
                              src="/icons/Negative.svg"
                              width={12}
                              height={12}
                              alt="-"
                            />
                            <span className="text-[#B2B2B2] text-xs">
                              Syllable difference...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Length and Speed Section */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Length Section */}
                    <div
                      className="bg-white dark:bg-[#1B1C1D] rounded-lg p-4"
                      onClick={() => setIsExpanded(false)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Image
                          src="/icons/Length.svg"
                          width={20}
                          height={20}
                          alt="Length"
                        />
                        <span className="text-[#1B1C1D] dark:text-white font-medium">Length</span>

                        <div>
                          <Image
                            src="/icons/ExpandDark.svg"
                            height={16}
                            width={16}
                            alt={"Expand Arrow"}
                            className="dark:hidden ml-[4px] px-[3px] py-[2px]"
                          />
                          <Image
                            src="/icons/Expand.svg"
                            height={16}
                            width={16}
                            alt={"Expand Arrow"}
                            className="hidden dark:block ml-[4px] px-[3px] py-[2px]"
                          />
                        </div>
                      </div>
                      <LinearProgressBar
                        progress={lengthBreakdown.percentage * 100}
                        height={8}
                        strokeWidth={8}
                        activeColor="#5CE2C7"
                        inactiveColor={darkMode ? "#343737" : "#F5F5F5"}  
                      />
                      <div className="mt-4 space-y-2">
                        {lengthBreakdown.longSentences > 0 && (
                          <div className="flex items-center gap-2">
                            <Image
                              src="/icons/Positive.svg"
                              width={12}
                              height={12}
                              alt="+"
                            />
                            <span className="text-[#B2B2B2] text-xs">
                              Long Sentences ({lengthBreakdown.longSentences})
                            </span>
                          </div>
                        )}
                        {lengthBreakdown.midSentences > 0 && (
                          <div className="flex items-center gap-2">
                            <Image
                              src="/icons/Positive.svg"
                              width={12}
                              height={12}
                              alt="+"
                            />
                            <span className="text-[#B2B2B2] text-xs">
                              Mid Sentences ({lengthBreakdown.midSentences})
                            </span>
                          </div>
                        )}
                        {lengthBreakdown.shortSentences > 0 && (
                          <div className="flex items-center gap-2">
                            <Image
                              src="/icons/Negative.svg"
                              width={12}
                              height={12}
                              alt="-"
                            />
                            <span className="text-[#B2B2B2] text-xs">
                              Short sentences ({lengthBreakdown.shortSentences})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Speed Section */}
                    <div
                      className="bg-white dark:bg-[#1B1C1D] rounded-lg p-4"
                      onClick={() => setIsExpanded(false)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Image
                          src="/icons/Speed.svg"
                          width={20}
                          height={20}
                          alt="Speed"
                        />
                        <span className="text-[#1B1C1D] dark:text-white font-medium">Speed</span>

                        <div>
                          <Image
                            src="/icons/ExpandDark.svg"
                            height={16}
                            width={16}
                            alt={"Expand Arrow"}
                            className="dark:hidden ml-[4px] px-[3px] py-[2px]"
                          />
                          <Image
                            src="/icons/Expand.svg"
                            height={16}
                            width={16}
                            alt={"Expand Arrow"}
                            className="hidden dark:block ml-[4px] px-[3px] py-[2px]"
                          />
                        </div>
                      </div>
                      <LinearProgressBar
                        progress={speedBreakdown.percentage * 100}
                        height={8}
                        strokeWidth={8}
                        activeColor="#5CE2C7"
                        inactiveColor={darkMode ? "#343737" : "#F5F5F5"}  
                      />
                      <div className="mt-4 space-y-2">
                        {speedBreakdown.timeRemaining > 0 && (
                          <div className="flex items-center gap-2">
                            <Image
                              src="/icons/Positive.svg"
                              width={12}
                              height={12}
                              alt="+"
                            />
                            <span className="text-[#B2B2B2] text-xs">
                              Time Remaining ({speedBreakdown.timeRemaining})
                            </span>
                          </div>
                        )}
                        {speedBreakdown.ranOutOfTime && (
                          <div className="flex items-center gap-2">
                            <Image
                              src="/icons/Negative.svg"
                              width={12}
                              height={12}
                              alt="-"
                            />
                            <span className="text-[#B2B2B2] text-xs">
                              Ran out of time
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lyrics/Bars Section */}
              <div className="bg-white dark:bg-[#1B1C1D] rounded-2xl">
                {displayLines.map((line, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2.5 p-4 border-2 border-[#F5F5F5] dark:border-[#25292D]`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#5CE2C7] text-black font-semibold flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    <p className="text-[#1B1C1D] dark:text-white text-sm leading-relaxed flex-1">
                      {line}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  );
};

export default ScoreDetailsBottomSheet;
