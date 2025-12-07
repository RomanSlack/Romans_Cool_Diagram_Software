"use client";

import { useDiagramStore } from "@/lib/store/diagramStore";
import {
  Square,
  Type,
  SquareDashed,
  Undo2,
  Redo2,
  Copy,
  Clipboard,
  CopyPlus,
  Trash2,
  Grid3X3,
  Magnet,
  ZoomIn,
  ZoomOut,
  MousePointer2,
  Spline,
} from "lucide-react";

export function Toolbar() {
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
    duplicateElements,
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
    <div className="h-12 bg-white border-b border-gray-200 flex items-center px-3 gap-1">
      {/* Selection Tools */}
      <ToolGroup>
        <ToolButton
          onClick={() => setActiveTool("select")}
          active={activeTool === "select"}
          title="Select (V)"
        >
          <MousePointer2 size={16} />
        </ToolButton>
        <ToolButton
          onClick={() => setActiveTool("connect")}
          active={activeTool === "connect"}
          title="Connect (E)"
        >
          <Spline size={16} />
        </ToolButton>
      </ToolGroup>

      <Divider />

      {/* Add tools */}
      <ToolGroup>
        <ToolButton onClick={() => addNode()} title="Add Node (N)">
          <Square size={16} />
        </ToolButton>
        <ToolButton onClick={() => addText()} title="Add Text (T)">
          <Type size={16} />
        </ToolButton>
        <ToolButton onClick={() => addContainer()} title="Add Container (C)">
          <SquareDashed size={16} />
        </ToolButton>
      </ToolGroup>

      <Divider />

      {/* Edit actions */}
      <ToolGroup>
        <ToolButton onClick={undo} disabled={!canUndo} title="Undo (⌘Z)">
          <Undo2 size={16} />
        </ToolButton>
        <ToolButton onClick={redo} disabled={!canRedo} title="Redo (⌘⇧Z)">
          <Redo2 size={16} />
        </ToolButton>
      </ToolGroup>

      <Divider />

      <ToolGroup>
        <ToolButton onClick={copy} disabled={!hasSelection} title="Copy (⌘C)">
          <Copy size={16} />
        </ToolButton>
        <ToolButton onClick={() => paste()} title="Paste (⌘V)">
          <Clipboard size={16} />
        </ToolButton>
        <ToolButton
          onClick={() => duplicateElements(selectedIds)}
          disabled={!hasSelection}
          title="Duplicate (⌘D)"
        >
          <CopyPlus size={16} />
        </ToolButton>
        <ToolButton
          onClick={() => deleteElements(selectedIds)}
          disabled={!hasSelection}
          title="Delete (⌫)"
        >
          <Trash2 size={16} />
        </ToolButton>
      </ToolGroup>

      <Divider />

      {/* View controls */}
      <ToolGroup>
        <ToolButton
          onClick={() => updateCanvas({ showGrid: !diagram.canvas.showGrid })}
          active={diagram.canvas.showGrid}
          title="Toggle Grid"
        >
          <Grid3X3 size={16} />
        </ToolButton>
        <ToolButton
          onClick={() => updateCanvas({ snapToGrid: !diagram.canvas.snapToGrid })}
          active={diagram.canvas.snapToGrid}
          title="Snap to Grid"
        >
          <Magnet size={16} />
        </ToolButton>
      </ToolGroup>

      <Divider />

      {/* Zoom */}
      <ToolGroup>
        <ToolButton onClick={zoomOut} title="Zoom Out">
          <ZoomOut size={16} />
        </ToolButton>
        <button
          onClick={resetZoom}
          className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded min-w-[50px]"
        >
          {Math.round(viewport.zoom * 100)}%
        </button>
        <ToolButton onClick={zoomIn} title="Zoom In">
          <ZoomIn size={16} />
        </ToolButton>
      </ToolGroup>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Selection info */}
      {hasSelection && (
        <div className="text-xs text-gray-500 px-2">
          {selectedIds.length} selected
        </div>
      )}
    </div>
  );
}

function ToolGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function Divider() {
  return <div className="w-px h-6 bg-gray-200 mx-2" />;
}

interface ToolButtonProps {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}

function ToolButton({ onClick, disabled, active, title, children }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        w-8 h-8 flex items-center justify-center rounded-md
        transition-all duration-100
        ${active ? "bg-blue-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {children}
    </button>
  );
}
