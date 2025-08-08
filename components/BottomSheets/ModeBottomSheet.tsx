import React from 'react';
import { Sheet } from 'react-modal-sheet';
import Image from 'next/image';

type GameMode = "4-Bar Mode" | "Rapid Fire Mode" | "Endless Mode";

interface ModeBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  gameMode: GameMode;
  onGameModeSelect: (gameMode: GameMode) => void;
}

const ModeBottomSheet: React.FC<ModeBottomSheetProps> = ({
  isOpen,
  onClose,
  gameMode,
  onGameModeSelect
}) => {
  const getGameModeIconProps = (icon: GameMode) => {
    switch (icon) {
      case "4-Bar Mode":
        return {
          className: "mr-[10px]",
          width: 16,
          height: 16,
        };
      case "Rapid Fire Mode":
        return {
          className: "mr-[10px]", 
          width: 16,
          height: 16,
        };
      case "Endless Mode":
        return {
          className: "mr-[10px]",
          width: 16,
          height: 16,
        };
      default:
        return {};
    }
  };

  const handleGameModeSelect = (selectedMode: GameMode) => {
    if (selectedMode === "4-Bar Mode") {
      onGameModeSelect(selectedMode);
      onClose();
    }
    // For other modes, don't close since they're locked
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} snapPoints={[0.45]}>
      <Sheet.Container className="!bg-[#f4f5f6] dark:!bg-[#25292D] rounded-[25px]">
        <Sheet.Header className="!bg-[#f4f5f6] dark:!bg-[#25292D]" />
        <Sheet.Content className="px-6 pb-safe !bg-[#f4f5f6] dark:!bg-[#25292D]">
          <div className="flex flex-col">
            
            <button
              onClick={() => handleGameModeSelect("4-Bar Mode")}
              className={`px-[15px] py-[15px] mb-[12px] justify-center items-start flex flex-col rounded-xl ${
                gameMode === "4-Bar Mode" ? "bg-[#fff] dark:bg-[#1C1E1E]" : ""
              }`}
            >
              <div className="text-[16px] font-bold tracking-wider flex flex-row items-center">
                <Image 
                  src="/icons/FourBarMode.svg" 
                  height={getGameModeIconProps("4-Bar Mode").height} 
                  width={getGameModeIconProps("4-Bar Mode").width} 
                  alt="4-Bar Mode Icon" 
                  className={getGameModeIconProps("4-Bar Mode").className} 
                />
                4-Bar Mode
              </div>
              <p className='text-[12px] text-[#B2B2B2] text-left pl-2 mt-1'>
                Write 4 sentences that rhyme with the keyword within the time limit.
              </p>
            </button>

            <button
              onClick={() => handleGameModeSelect("Rapid Fire Mode")}
              className="px-[15px] py-[15px] mb-[12px] justify-center items-start flex flex-col rounded-xl relative cursor-default"
            >
              <div className="text-[16px] font-bold tracking-wider flex flex-row items-center">
                <Image 
                  src="/icons/RapidFireMode.svg" 
                  height={24} 
                  width={23} 
                  alt="Rapid Fire Mode Icon" 
                  className='mr-[10px]' 
                />
                Rapid Fire Mode
              </div>
              <p className='text-[12px] text-[#B2B2B2] text-left pl-2 mt-1'>
                Write 2 sentences that rhyme with each keyword. Complete as many keywords as you can within the time limit.
              </p>
              <div className="absolute bottom-0 right-0 h-full w-full bg-[#0007] rounded-xl flex flex-col justify-center items-center">
                <Image src="/icons/Lock.svg" height={37.33} width={28.44} alt="Lock Icon" />
                <p className="text-[12px] text-white font-bold">Coming Soon</p>
              </div>
            </button>

            <button
              onClick={() => handleGameModeSelect("Endless Mode")}
              className="px-[15px] py-[15px] justify-center items-start flex flex-col rounded-xl relative cursor-default"
            >
              <div className="text-[16px] font-bold tracking-wider flex flex-row items-center">
                <Image 
                  src="/icons/EndlessMode.svg" 
                  height={12.15} 
                  width={25.15} 
                  alt="Endless Mode Icon" 
                  className='mr-[10px]' 
                />
                Endless Mode
              </div>
              <p className='text-[12px] text-[#B2B2B2] text-left pl-2 mt-1'>
                Write as many sentences as possible that rhyme until you run out of lives.
              </p>
              <div className="absolute bottom-0 right-0 h-full w-full bg-[#0007] rounded-xl flex flex-col justify-center items-center">
                <Image src="/icons/Lock.svg" height={37.33} width={28.44} alt="Lock Icon" />
                <p className="text-[12px] text-white font-bold">Coming Soon</p>
              </div>
            </button>
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  );
};

export default ModeBottomSheet;