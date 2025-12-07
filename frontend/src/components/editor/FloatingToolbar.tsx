"use client";

import { useDiagramStore } from "@/lib/store/diagramStore";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  Square,
  Type,
  SquareDashed,
  Undo2,
  Redo2,
  Copy,
  Clipboard,
  Trash2,
  Grid3X3,
  Magnet,
  MousePointer2,
  Spline,
  Minus,
  Plus,
} from "lucide-react";

export function FloatingToolbar() {
  const {
    diagram,
    selectedIds,
    viewport,
    activeTool,
    updateCanvas,
    addNode,
    addText,
    addContainer,
    deleteElements,
    copy,
    paste,
    undo,
    redo,
    zoomIn,
    zoomOut,
    resetZoom,
    setActiveTool,
    history,
    historyIndex,
  } = useDiagramStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasSelection = selectedIds.length > 0;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div
        className="
          flex items-center gap-1 px-2 py-1.5
          bg-white/95 backdrop-blur-sm
          border border-gray-200/80
          rounded-xl shadow-lg shadow-black/5
        "
      >
        {/* Selection Tools */}
        <ToolGroup>
          <ToolButton
            onClick={() => setActiveTool("select")}
            active={activeTool === "select"}
            tooltip="Select (V)"
          >
            <MousePointer2 size={18} />
          </ToolButton>
          <ToolButton
            onClick={() => setActiveTool("connect")}
            active={activeTool === "connect"}
            tooltip="Connect (E)"
          >
            <Spline size={18} />
          </ToolButton>
        </ToolGroup>

        <Divider />

        {/* Add tools */}
        <ToolGroup>
          <ToolButton onClick={() => addNode()} tooltip="Add Node (N)">
            <Square size={18} />
          </ToolButton>
          <ToolButton onClick={() => addText()} tooltip="Add Text (T)">
            <Type size={18} />
          </ToolButton>
          <ToolButton onClick={() => addContainer()} tooltip="Add Container (C)">
            <SquareDashed size={18} />
          </ToolButton>
        </ToolGroup>

        <Divider />

        {/* Edit actions */}
        <ToolGroup>
          <ToolButton onClick={undo} disabled={!canUndo} tooltip="Undo (Cmd+Z)">
            <Undo2 size={18} />
          </ToolButton>
          <ToolButton onClick={redo} disabled={!canRedo} tooltip="Redo (Cmd+Shift+Z)">
            <Redo2 size={18} />
          </ToolButton>
        </ToolGroup>

        <Divider />

        <ToolGroup>
          <ToolButton onClick={copy} disabled={!hasSelection} tooltip="Copy (Cmd+C)">
            <Copy size={18} />
          </ToolButton>
          <ToolButton onClick={() => paste()} tooltip="Paste (Cmd+V)">
            <Clipboard size={18} />
          </ToolButton>
          <ToolButton
            onClick={() => deleteElements(selectedIds)}
            disabled={!hasSelection}
            tooltip="Delete"
            danger
          >
            <Trash2 size={18} />
          </ToolButton>
        </ToolGroup>

        <Divider />

        {/* View controls */}
        <ToolGroup>
          <ToolButton
            onClick={() => updateCanvas({ showGrid: !diagram.canvas.showGrid })}
            active={diagram.canvas.showGrid}
            tooltip="Toggle Grid"
          >
            <Grid3X3 size={18} />
          </ToolButton>
          <ToolButton
            onClick={() => updateCanvas({ snapToGrid: !diagram.canvas.snapToGrid })}
            active={diagram.canvas.snapToGrid}
            tooltip="Snap to Grid"
          >
            <Magnet size={18} />
          </ToolButton>
        </ToolGroup>

        <Divider />

        {/* Zoom */}
        <ToolGroup>
          <ToolButton onClick={zoomOut} tooltip="Zoom Out">
            <Minus size={16} />
          </ToolButton>
          <button
            onClick={resetZoom}
            className="
              px-2 py-1 min-w-[52px] text-xs font-medium text-gray-600
              hover:bg-gray-100 rounded-md transition-colors
            "
          >
            {Math.round(viewport.zoom * 100)}%
          </button>
          <ToolButton onClick={zoomIn} tooltip="Zoom In">
            <Plus size={16} />
          </ToolButton>
        </ToolGroup>
      </div>
    </div>
  );
}

function ToolGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function Divider() {
  return <div className="w-px h-6 bg-gray-200 mx-1" />;
}

interface ToolButtonProps {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  tooltip?: string;
  danger?: boolean;
  children: React.ReactNode;
}

function ToolButton({ onClick, disabled, active, tooltip, danger, children }: ToolButtonProps) {
  const button = (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-9 h-9 flex items-center justify-center rounded-lg
        transition-all duration-100
        ${active
          ? "bg-blue-500 text-white shadow-sm"
          : danger && !disabled
          ? "text-gray-500 hover:bg-red-50 hover:text-red-500"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        }
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer active:scale-95"}
      `}
    >
      {children}
    </button>
  );

  if (tooltip && !disabled) {
    return (
      <Tooltip content={tooltip} position="top">
        {button}
      </Tooltip>
    );
  }

  return button;
}
