"use client";

import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  delay?: number;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({
  content,
  children,
  delay = 400,
  position = "top",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionStyles: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && content && (
        <div
          className={`
            absolute z-[100] whitespace-nowrap
            px-2 py-1 text-xs font-medium
            bg-gray-900 text-white rounded-md shadow-lg
            animate-scale-in
            ${positionStyles[position]}
          `}
        >
          {content}
          <div
            className={`
              absolute w-2 h-2 bg-gray-900 rotate-45
              ${position === "top" ? "top-full left-1/2 -translate-x-1/2 -mt-1" : ""}
              ${position === "bottom" ? "bottom-full left-1/2 -translate-x-1/2 -mb-1" : ""}
              ${position === "left" ? "left-full top-1/2 -translate-y-1/2 -ml-1" : ""}
              ${position === "right" ? "right-full top-1/2 -translate-y-1/2 -mr-1" : ""}
            `}
          />
        </div>
      )}
    </div>
  );
}
