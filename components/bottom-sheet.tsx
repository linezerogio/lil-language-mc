"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSpring, animated, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

interface BottomSheetProps {
  trigger: React.ReactNode;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Create an animated version of SheetContent
const AnimatedSheetContent = animated(SheetContent);

export function BottomSheet({ 
  trigger, 
  title, 
  description, 
  children, 
  footer,
  open: controlledOpen,
  onOpenChange: setControlledOpen
}: BottomSheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  // Use either controlled or uncontrolled state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen || setInternalOpen;
  
  // Visual state for animation - this can be different from the actual open state
  const [visualState, setVisualState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  
  // Animation duration in ms - reduced for faster animations
  const ANIMATION_DURATION = 150;
  
  const sheetRef = useRef<HTMLDivElement>(null);
  
  // Spring for the sheet position
  const [{ y }, api] = useSpring(() => ({ 
    y: typeof window !== 'undefined' ? window.innerHeight : 800,
    config: { ...config.default, duration: ANIMATION_DURATION }
  }));

  // Track if we're currently dragging to prevent animation conflicts
  const [dragging, setDragging] = useState(false);

  // Manage visual state based on open prop
  useEffect(() => {
    if (open && visualState === 'closed') {
      setVisualState('opening');
      api.start({ 
        y: 0, 
        immediate: false,
        config: { duration: ANIMATION_DURATION },
        onRest: () => setVisualState('open')
      });
    } else if (!open && (visualState === 'open' || visualState === 'opening')) {
      setVisualState('closing');
      api.start({ 
        y: typeof window !== 'undefined' ? window.innerHeight : 800, 
        immediate: false,
        config: { duration: ANIMATION_DURATION },
        onRest: () => setVisualState('closed')
      });
    }
  }, [open, api, visualState]);

  // Handle closing the sheet with animation
  const handleClose = () => {
    if (visualState === 'closing') return; // Prevent multiple close calls
    
    setVisualState('closing');
    api.start({ 
      y: typeof window !== 'undefined' ? window.innerHeight : 800, 
      immediate: false,
      config: { duration: ANIMATION_DURATION },
      onRest: () => {
        setVisualState('closed');
        setOpen(false);
      }
    });
  };

  // Gesture binding for interactive drag-to-dismiss
  const bind = useDrag(
    ({ down, movement: [_, my], velocity: [__, vy], direction: [___, dy] }) => {
      // Only allow downward drag
      if (my < 0) {
        if (down) api.start({ y: 0, immediate: true });
        return;
      }

      setDragging(down);
      
      // If we're actively dragging, move the sheet
      if (down) {
        api.start({ y: my, immediate: true });
        return;
      }
      
      // When released, decide to close or snap back
      const shouldClose = my > 100 || (vy > 0.5 && dy > 0);
      
      if (shouldClose) {
        handleClose();
      } else {
        // Snap back with spring animation
        api.start({ 
          y: 0, 
          immediate: false,
          config: { tension: 300, friction: 30, duration: 0 }
        });
      }
    },
    { filterTaps: true, bounds: { top: 0 }, rubberband: true }
  );

  return (
    <Sheet 
      open={open || visualState !== 'closed'} 
      onOpenChange={(newOpen) => {
        if (!newOpen && visualState === 'open') {
          handleClose();
        } else {
          setOpen(newOpen);
        }
      }}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      
      <AnimatedSheetContent 
        side="bottom" 
        className="p-0 border-0 overflow-hidden bg-[#121212] dark:bg-[#121212] rounded-t-[20px]"
        style={{ 
          transform: y.to(y => `translateY(${y}px)`),
          touchAction: 'none',
          visibility: visualState === 'closed' ? 'hidden' : 'visible'
        }}
        {...bind()}
      >
        {/* Drag handle / notch */}
        <div 
          className="w-12 h-1 bg-gray-500 rounded-full mx-auto my-3 cursor-grab touch-none"
          ref={sheetRef}
        />
        
        <div className="px-6 pb-10">
          <SheetHeader className="mb-4">
            {title && <SheetTitle className="text-center text-white text-xl font-bold">{title}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          
          <div className="overflow-y-auto">{children}</div>
          
          {footer && <SheetFooter>{footer}</SheetFooter>}
        </div>
      </AnimatedSheetContent>
    </Sheet>
  );
}