import React from 'react';
import { Sheet } from 'react-modal-sheet';
import Image from 'next/image';
import { Difficulty } from '@/types/difficulty';

interface DifficultyBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  difficulty: Difficulty;
  onDifficultySelect: (difficulty: Difficulty) => void;
}

const DifficultyBottomSheet: React.FC<DifficultyBottomSheetProps> = ({
  isOpen,
  onClose,
  difficulty,
  onDifficultySelect
}) => {
  const getDifficultyIconProps = (icon: Difficulty) => {
    switch (icon) {
      case "easy":
      case "zbra-easy":
        return {
          className: "mr-[10px]",
          width: 24,
          height: 14.744,
        };
      case "medium":
        return {
          className: "mr-[10px]",
          width: 24,
          height: 14.406,
        };
      case "hard":
      case "zbra-hard":
        return {
          className: "mr-[10px]",
          width: 24,
          height: 15.78,
        };
      default:
        return {};
    }
  };

  const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
    onDifficultySelect(selectedDifficulty);
    onClose();
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} snapPoints={[320]}>
      <Sheet.Container className="!bg-[#f4f5f6] dark:!bg-[#25292D] rounded-[25px]">
        <Sheet.Header className="!bg-[#f4f5f6] dark:!bg-[#25292D]" />
        <Sheet.Content>
          <div className="flex flex-col gap-5 !bg-[#f4f5f6] dark:!bg-[#25292D] px-5 pb-safe">

            <button
              onClick={() => handleDifficultySelect("easy")}
              className={`px-[15px] py-[15px] justify-center items-start flex flex-col rounded-xl ${difficulty === "easy" ? "bg-[#fff] dark:bg-[#1C1E1E]" : ""}`}
            >
              <div className="text-[16px] font-bold tracking-wider flex flex-row items-center">
                <Image
                  src="/Easy.svg"
                  width={getDifficultyIconProps("easy").width}
                  height={getDifficultyIconProps("easy").height}
                  alt="Easy Icon"
                  className={getDifficultyIconProps("easy").className}
                />
                Easy
              </div>
              <p className='text-[12px] text-[#B2B2B2] text-left pl-2 mt-1'>
                Good for beginners or for maximizing rhymes.
              </p>
            </button>

            <button
              onClick={() => handleDifficultySelect("medium")}
              className={`px-[15px] py-[15px] justify-center items-start flex flex-col rounded-xl ${difficulty === "medium" ? "bg-[#fff] dark:bg-[#1C1E1E]" : ""}`}
            >
              <div className="text-[16px] font-bold tracking-wider flex flex-row items-center">
                <Image
                  src="/Medium.svg"
                  width={getDifficultyIconProps("medium").width}
                  height={getDifficultyIconProps("medium").height}
                  alt="Medium Icon"
                  className={getDifficultyIconProps("medium").className}
                />
                Medium
              </div>
              <p className='text-[12px] text-[#B2B2B2] text-left pl-2 mt-1'>
                Little bit of a challenge to push your limit.
              </p>
            </button>

            <button
              onClick={() => handleDifficultySelect("hard")}
              className={`px-[15px] py-[15px] justify-center items-start flex flex-col rounded-xl ${difficulty === "hard" ? "bg-[#fff] dark:bg-[#1C1E1E]" : ""}`}
            >
              <div className="text-[16px] font-bold tracking-wider flex flex-row items-center">
                <Image
                  src="/Hard.svg"
                  width={getDifficultyIconProps("hard").width}
                  height={getDifficultyIconProps("hard").height}
                  alt="Hard Icon"
                  className={getDifficultyIconProps("hard").className}
                />
                Hard
              </div>
              <p className='text-[12px] text-[#B2B2B2] text-left pl-2 mt-1'>
                Some of the most difficult words to rhyme with.
              </p>
            </button>

            {difficulty === 'zbra-easy' && (
              <button
                onClick={() => handleDifficultySelect("zbra-easy")}
                className={`px-[15px] py-[15px] justify-center items-start flex flex-col rounded-xl ${difficulty === "zbra-easy" ? "bg-[#fff] dark:bg-[#1C1E1E]" : ""}`}
              >
                <div className="text-[16px] font-bold tracking-wider flex flex-row items-center">
                  <Image
                    src="/icons/ZBRAEasy.svg"
                    width={getDifficultyIconProps("zbra-easy").width}
                    height={getDifficultyIconProps("zbra-easy").height}
                    alt="ZBRA Easy Icon"
                    className={getDifficultyIconProps("zbra-easy").className}
                  />
                  ZBRA Easy
                </div>
                <p className='text-[12px] text-[#B2B2B2] text-left pl-2 mt-1'>
                  Good for beginner Zbra&apos;s so they can finally reach 500 pts maybe.
                </p>
              </button>
            )}

            {difficulty === 'zbra-hard' && (
              <button
                onClick={() => handleDifficultySelect("zbra-hard")}
                className={`px-[15px] py-[15px] justify-center items-start flex flex-col rounded-xl ${difficulty === "zbra-hard" ? "bg-[#fff] dark:bg-[#1C1E1E]" : ""}`}
              >
                <div className="text-[16px] font-bold tracking-wider flex flex-row items-center">
                  <Image
                    src="/icons/ZBRAHard.svg"
                    width={getDifficultyIconProps("zbra-hard").width}
                    height={getDifficultyIconProps("zbra-hard").height}
                    alt="ZBRA Hard Icon"
                    className={getDifficultyIconProps("zbra-hard").className}
                  />
                  ZBRA Hard
                </div>
                <p className='text-[12px] text-[#B2B2B2] text-left pl-2 mt-1'>
                  Very difficult, only for the trained zbra&apos;s, not just any zbra.
                </p>
              </button>
            )}
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop onTap={onClose} />
    </Sheet>
  );
};

export default DifficultyBottomSheet;