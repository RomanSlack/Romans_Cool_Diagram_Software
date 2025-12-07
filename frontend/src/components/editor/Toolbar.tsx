"use client";

import { useDiagramStore } from "@/lib/store/diagramStore";

export function Toolbar() {
  const {
    diagram,
    selectedIds,
    viewport,
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
    history,
    historyIndex,
  } = useDiagramStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasSelection = selectedIds.length > 0;

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center px-3 gap-1">
      {/* Logo */}
      <div className="flex items-center gap-2 pr-3 border-r border-gray-200 mr-2">
        <span className="text-sm font-bold text-gray-900">RCDS</span>
      </div>

      {/* Add tools */}
      <ToolGroup>
        <ToolButton onClick={() => addNode()} title="Add Node (N)">
          <RectIcon />
        </ToolButton>
        <ToolButton onClick={() => addText()} title="Add Text (T)">
          <TextIcon />
        </ToolButton>
        <ToolButton onClick={() => addContainer()} title="Add Container (C)">
          <ContainerIcon />
        </ToolButton>
      </ToolGroup>

      <Divider />

      {/* Edit actions */}
      <ToolGroup>
        <ToolButton onClick={undo} disabled={!canUndo} title="Undo (⌘Z)">
          <UndoIcon />
        </ToolButton>
        <ToolButton onClick={redo} disabled={!canRedo} title="Redo (⌘⇧Z)">
          <RedoIcon />
        </ToolButton>
      </ToolGroup>

      <Divider />

      <ToolGroup>
        <ToolButton onClick={copy} disabled={!hasSelection} title="Copy (⌘C)">
          <CopyIcon />
        </ToolButton>
        <ToolButton onClick={() => paste()} title="Paste (⌘V)">
          <PasteIcon />
        </ToolButton>
        <ToolButton
          onClick={() => duplicateElements(selectedIds)}
          disabled={!hasSelection}
          title="Duplicate (⌘D)"
        >
          <DuplicateIcon />
        </ToolButton>
        <ToolButton
          onClick={() => deleteElements(selectedIds)}
          disabled={!hasSelection}
          title="Delete (⌫)"
        >
          <TrashIcon />
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
          <GridIcon />
        </ToolButton>
        <ToolButton
          onClick={() => updateCanvas({ snapToGrid: !diagram.canvas.snapToGrid })}
          active={diagram.canvas.snapToGrid}
          title="Snap to Grid"
        >
          <MagnetIcon />
        </ToolButton>
      </ToolGroup>

      <Divider />

      {/* Zoom */}
      <ToolGroup>
        <ToolButton onClick={zoomOut} title="Zoom Out">
          <MinusIcon />
        </ToolButton>
        <button
          onClick={resetZoom}
          className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded min-w-[50px]"
        >
          {Math.round(viewport.zoom * 100)}%
        </button>
        <ToolButton onClick={zoomIn} title="Zoom In">
          <PlusIcon />
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
        w-8 h-8 flex items-center justify-center rounded
        transition-all duration-100
        ${active ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {children}
    </button>
  );
}

// ============ ICONS ============

function RectIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="10" rx="1" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 3h10v2H9v8H7V5H3V3z" />
    </svg>
  );
}

function ContainerIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2,2">
      <rect x="2" y="3" width="12" height="10" rx="1" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8h8a3 3 0 1 1 0 6H9" />
      <path d="M6 5L3 8l3 3" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 8H5a3 3 0 1 0 0 6h2" />
      <path d="M10 5l3 3-3 3" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="5" width="8" height="8" rx="1" />
      <path d="M3 11V3h8" />
    </svg>
  );
}

function PasteIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="4" width="10" height="10" rx="1" />
      <path d="M6 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1" />
    </svg>
  );
}

function DuplicateIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="8" height="8" rx="1" />
      <rect x="6" y="6" width="8" height="8" rx="1" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 4h10M6 4V3h4v1M5 4v9h6V4" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 2h12v12H2z" />
      <path d="M2 6h12M2 10h12M6 2v12M10 2v12" />
    </svg>
  );
}

function MagnetIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 2v4a4 4 0 0 0 8 0V2" />
      <rect x="2" y="2" width="4" height="3" />
      <rect x="10" y="2" width="4" height="3" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8h10" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}
