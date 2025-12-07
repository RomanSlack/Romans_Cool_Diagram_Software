"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  active?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "secondary", size = "md", active = false, children, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center
      font-medium rounded-lg
      transition-all duration-150 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-1
      disabled:opacity-50 disabled:cursor-not-allowed
      select-none
    `;

    const variants = {
      primary: `
        bg-gray-900 text-white
        hover:bg-gray-800
        active:bg-gray-950 active:scale-[0.98]
        focus:ring-gray-400
        shadow-sm
      `,
      secondary: `
        bg-white text-gray-700
        border border-gray-200
        hover:bg-gray-50 hover:border-gray-300
        active:bg-gray-100 active:scale-[0.98]
        focus:ring-gray-300
        shadow-sm
      `,
      ghost: `
        bg-transparent text-gray-600
        hover:bg-gray-100 hover:text-gray-900
        active:bg-gray-150 active:scale-[0.98]
        focus:ring-gray-300
      `,
      danger: `
        bg-red-500 text-white
        hover:bg-red-600
        active:bg-red-700 active:scale-[0.98]
        focus:ring-red-300
        shadow-sm
      `,
    };

    const sizes = {
      sm: "px-2.5 py-1.5 text-xs gap-1.5",
      md: "px-3 py-2 text-sm gap-2",
      lg: "px-4 py-2.5 text-base gap-2",
    };

    const activeStyles = active
      ? "bg-gray-100 border-gray-300 text-gray-900 shadow-inner"
      : "";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${activeStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

// Toggle button specifically for toolbar items
interface ToggleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: "sm" | "md";
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ className = "", active = false, size = "md", children, ...props }, ref) => {
    const sizes = {
      sm: "px-2 py-1.5 text-xs",
      md: "px-3 py-2 text-sm",
    };

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-1.5
          font-medium rounded-md
          transition-all duration-150 ease-out
          select-none
          ${sizes[size]}
          ${
            active
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          }
          active:scale-[0.97]
          focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ToggleButton.displayName = "ToggleButton";

// Icon button for compact actions
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className = "", size = "md", children, ...props }, ref) => {
    const sizes = {
      sm: "w-7 h-7 text-sm",
      md: "w-9 h-9 text-base",
      lg: "w-11 h-11 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center
          rounded-lg
          text-gray-500
          transition-all duration-150 ease-out
          hover:bg-gray-100 hover:text-gray-700
          active:bg-gray-200 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
