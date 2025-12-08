"use client";

import { Coffee, Github } from "lucide-react";

export function BuyMeCoffee() {
  return (
    <a
      href="https://buymeacoffee.com/romanslack"
      target="_blank"
      rel="noopener noreferrer"
      className="
        fixed bottom-3 right-[296px] z-50
        flex items-center gap-1.5 px-2.5 py-1.5
        bg-yellow-400 hover:bg-yellow-500
        text-yellow-900 font-medium text-xs
        rounded-full shadow-md shadow-yellow-400/20
        transition-all duration-200
        hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/30
        group
      "
    >
      <Coffee size={14} className="group-hover:animate-bounce" />
      <span>Support</span>
    </a>
  );
}

export function GithubLink() {
  return (
    <a
      href="https://github.com/RomanSlack/Romans_Cool_Diagram_Software"
      target="_blank"
      rel="noopener noreferrer"
      className="
        fixed bottom-3 right-[380px] z-50
        flex items-center justify-center
        w-7 h-7
        bg-gray-800 hover:bg-gray-900
        text-white
        rounded-full shadow-md
        transition-all duration-200
        hover:scale-110 hover:shadow-lg
      "
      title="View on GitHub"
    >
      <Github size={14} />
    </a>
  );
}
