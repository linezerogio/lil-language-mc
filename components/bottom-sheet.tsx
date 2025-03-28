"use client";

import React, { useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSpring, animated } from '@react-spring/web';
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
  
  const sheetRef = useRef<HTMLDivElement>(null);
  const [{ y }, api] = useSpring(() => ({ y: 0 }));

  // Track if we're currently dragging to prevent animation conflicts
  const [dragging, setDragging] = useState(false);

  // Gesture binding for interactive drag-to-dismiss
  const bind = useDrag(
    ({ down, movement: [_, my], velocity: [__, vy], direction: [___, dy], cancel }) => {
      // Only allow downward drag
      if (my < 0) {
        if (down) api.start({ y: 0 });
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
        setOpen(false);
        api.start({ y: 0, immediate: false });
      } else {
        // Snap back with spring animation
        api.start({ 
          y: 0, 
          immediate: false,
          config: { tension: 300, friction: 30 }
        });
      }
    },
    { filterTaps: true, bounds: { top: 0 }, rubberband: true }
  );

  // Reset y position when sheet closes or opens
  React.useEffect(() => {
    if (!dragging) {
      api.start({ y: 0, immediate: !open });
    }
  }, [open, api, dragging]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      
      <AnimatedSheetContent 
        side="bottom" 
        className="p-0 border-0 overflow-hidden bg-[#121212] dark:bg-[#121212] rounded-t-[20px]"
        style={{ 
          transform: y.to(y => `translateY(${y}px)`),
          touchAction: 'none' 
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