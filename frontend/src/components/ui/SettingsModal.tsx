"use client";

import { useState, useEffect } from "react";
import { X, Grid3X3, Save } from "lucide-react";
import { useDiagramStore } from "@/lib/store/diagramStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { diagram, updateCanvas } = useDiagramStore();
  const [gridSize, setGridSize] = useState(diagram.canvas.gridSize);

  useEffect(() => {
    setGridSize(diagram.canvas.gridSize);
  }, [diagram.canvas.gridSize]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGridSizeChange = (value: number) => {
    setGridSize(value);
    updateCanvas({ gridSize: value });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 animate-scale-in">
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Canvas Settings */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Grid3X3 size={16} />
                Canvas
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Background Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={diagram.canvas.background}
                      onChange={(e) => updateCanvas({ background: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={diagram.canvas.background}
                      onChange={(e) => updateCanvas({ background: e.target.value })}
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Grid Size</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={5}
                      max={50}
                      step={5}
                      value={gridSize}
                      onChange={(e) => handleGridSizeChange(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-12 text-right">{gridSize}px</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Show Grid</span>
                  <button
                    onClick={() => updateCanvas({ showGrid: !diagram.canvas.showGrid })}
                    className={`
                      w-11 h-6 rounded-full transition-colors duration-200
                      ${diagram.canvas.showGrid ? "bg-blue-500" : "bg-gray-200"}
                    `}
                  >
                    <div
                      className={`
                        w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200
                        ${diagram.canvas.showGrid ? "translate-x-5" : "translate-x-0.5"}
                      `}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Snap to Grid</span>
                  <button
                    onClick={() => updateCanvas({ snapToGrid: !diagram.canvas.snapToGrid })}
                    className={`
                      w-11 h-6 rounded-full transition-colors duration-200
                      ${diagram.canvas.snapToGrid ? "bg-blue-500" : "bg-gray-200"}
                    `}
                  >
                    <div
                      className={`
                        w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200
                        ${diagram.canvas.snapToGrid ? "translate-x-5" : "translate-x-0.5"}
                      `}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Auto-save Settings */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Save size={16} />
                Auto-save
              </h3>
              <p className="text-sm text-gray-500">
                Your diagrams are automatically saved to your browser&apos;s local storage.
                Changes are saved every 30 seconds when you make edits.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
