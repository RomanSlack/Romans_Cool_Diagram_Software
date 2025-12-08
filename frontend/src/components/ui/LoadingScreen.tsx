"use client";

import Image from "next/image";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center">
      {/* Logo with pulse animation */}
      <div className="relative animate-pulse">
        <Image
          src="/logo.png"
          alt="RCDS Logo"
          width={80}
          height={80}
          className="rounded-2xl shadow-lg"
          priority
        />
      </div>

      {/* App name */}
      <div className="mt-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Roman&apos;s Cool Diagram Software
        </h1>
        <p className="text-sm text-gray-500 mt-1">Loading your workspace...</p>
      </div>

      {/* Loading bar */}
      <div className="mt-8 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full animate-loading-bar" />
      </div>
    </div>
  );
}
