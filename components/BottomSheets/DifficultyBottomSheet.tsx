import React from 'react';
import { Sheet } from 'react-modal-sheet';
import Image from 'next/image';

type Difficulty = "easy" | "medium" | "hard";

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
    <Sheet isOpen={isOpen} onClose={onClose} snapPoints={[0.6]}>
      <Sheet.Container className="!bg-[#f4f5f6] dark:!bg-[#25292D] rounded-[25px]">
        <Sheet.Header className="!bg-[#f4f5f6] dark:!bg-[#25292D]" />
        <Sheet.Content className="px-6 pb-safe !bg-[#f4f5f6] dark:!bg-[#25292D]">
          <div className="flex flex-col">

            <button
              onClick={() => handleDifficultySelect("easy")}
              className={`px-[15px] py-[15px] mb-[12px] justify-center items-start flex flex-col rounded-xl ${difficulty === "easy" ? "bg-[#fff] dark:bg-[#1C1E1E]" : ""
                }`}
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
              className={`px-[15px] py-[15px] mb-[12px] justify-center items-start flex flex-col rounded-xl ${difficulty === "medium" ? "bg-[#fff] dark:bg-[#1C1E1E]" : ""
                }`}
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
              className={`px-[15px] py-[15px] justify-center items-start flex flex-col rounded-xl ${difficulty === "hard" ? "bg-[#fff] dark:bg-[#1C1E1E]" : ""
                }`}
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
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  );
};

export default DifficultyBottomSheet;