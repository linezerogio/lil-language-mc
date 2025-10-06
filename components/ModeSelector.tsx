"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import useIsMobile from '../hooks/useIsMobile';

// Simple cn utility for conditional classNames
function cn(...args: any[]) {
  return args
    .flat()
    .filter(Boolean)
    .join(' ');
}

interface ModeOption<T = string> {
  value: T;
  name: string;
  icon: string;
  description?: string;
  disabled?: boolean;
  iconProps: {
    width: number;
    height: number;
    mdWidth: number;
    mdHeight: number;
    className?: string;
  };
}

interface ModeSelectorProps<T = string> {
  options: ModeOption<T>[];
  selectedMode: T;
  onModeSelect: (mode: T) => void;
  onButtonClick: (mode: T) => void;
  onClose?: () => void;
  isMenuOpen: boolean;
  className?: string;
  buttonClassName?: string;
}

export default function ModeSelector<T extends string = string>({
  options,
  selectedMode,
  onModeSelect,
  onButtonClick,
  onClose,
  isMenuOpen,
  className = "",
  buttonClassName = ""
}: ModeSelectorProps<T>) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(option => option.value === selectedMode);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen && 
        !isMobile && 
        onClose && 
        containerRef.current && 
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isMenuOpen && !isMobile) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen, isMobile, onClose]);
  
  if (!selectedOption) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-[#FFF] dark:bg-[#1C1E1E] flex flex-row relative lg:w-[311px] justify-center rounded-[10px] lg:rounded-[25px] flex-1 lg:flex-none py-3 lg:py-0",
        isMenuOpen ? "z-50" : "z-10",
        className
      )}
    >
      {/* Selected Mode Button */}
      {(!isMenuOpen || isMobile) && (
        <button 
          type="button" 
          onClick={() => onButtonClick(selectedMode)} 
          className={cn(
            "justify-between items-center gap-2.5 flex flex-row flex-1 px-[15px] lg:px-[25px]",
            buttonClassName
          )}
        >
          <div className="text-[14px] lg:text-[25px] font-bold tracking-wider flex flex-row mr-auto items-center">
            <span className="block lg:hidden">
              <Image 
                src={selectedOption.icon} 
                width={selectedOption.iconProps.width} 
                height={selectedOption.iconProps.height} 
                alt={`${selectedOption.name} Icon`} 
                className={selectedOption.iconProps.className || "mr-[10px]"} 
              />
            </span>
            <span className="hidden lg:block">
              <Image 
                src={selectedOption.icon} 
                width={selectedOption.iconProps.mdWidth} 
                height={selectedOption.iconProps.mdHeight} 
                alt={`${selectedOption.name} Icon`} 
                className={selectedOption.iconProps.className || "mr-[10px]"} 
              />
            </span>
            {selectedOption.name}
          </div>
          <div>
            <Image 
              src="/icons/ExpandDark.svg" 
              height={20} 
              width={18} 
              alt="Expand Arrow" 
              className='dark:hidden ml-[4px] px-[3px] py-[2px]' 
            />
            <Image 
              src="/icons/Expand.svg" 
              height={20} 
              width={18} 
              alt="Expand Arrow" 
              className='hidden dark:block ml-[4px] px-[3px] py-[2px]' 
            />
          </div>
        </button>
      )}

      {/* Dropdown Menu */}
      {isMenuOpen && !isMobile && (
        <div className="flex flex-col absolute bottom-0 left-0 lg:left-auto bg-[#f4f5f6] dark:bg-[#25292D] w-[311px] rounded-[10px] lg:rounded-[25px] px-3 shadow-[0_4px_40.6px_rgba(0,0,0,0.25)]">
          {options.map((option, index) => (
          <button 
              key={option.value}
              type="button" 
              onMouseDown={(e) => { e.stopPropagation(); }}
              onClick={() => {
                if (!option.disabled) {
                  onModeSelect(option.value);
                  if (onClose) onClose();
                }
              }} 
              className={cn(
                "px-[10px] py-[15px] justify-center items-start flex flex-col rounded-xl relative",
                index === 0 && "mt-[12px]",
                index === options.length - 1 && "mb-[12px]",
                index > 0 && index < options.length - 1 && "my-[9px]",
                selectedMode === option.value ? "bg-[#fff] dark:bg-[#1C1E1E]" : "",
                option.disabled && "cursor-default"
              )}
            >
              <div className="text-[14px] lg:text-[25px] font-bold tracking-wider flex flex-row items-center">
                <span className="block lg:hidden">
                  <Image 
                    src={option.icon} 
                    width={option.iconProps.width} 
                    height={option.iconProps.height} 
                    alt={`${option.name} Icon`} 
                    className={option.iconProps.className || "mr-[10px]"} 
                  />
                </span>
                <span className="hidden lg:block">
                  <Image 
                    src={option.icon} 
                    width={option.iconProps.mdWidth} 
                    height={option.iconProps.mdHeight} 
                    alt={`${option.name} Icon`} 
                    className={option.iconProps.className || "mr-[10px]"} 
                  />
                </span>
                {option.name}
              </div>
              {option.description && (
                <p className='text-[12px] text-[#B2B2B2] text-left pl-2'>
                  {option.description}
                </p>
              )}
              {option.disabled && (
                <div className="absolute bottom-0 right-0 h-full w-full bg-[#0007] rounded-xl flex flex-col justify-center items-center">
                  <Image src="/icons/Lock.svg" height={37.33} width={28.44} alt="Lock Icon" />
                  <p className="text-[12px] text-white font-bold">Coming Soon</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
